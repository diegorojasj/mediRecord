import {
  differenceInYears,
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  endOfDay,
  endOfMonth,
  endOfYear,
  format,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subYears,
} from 'date-fns';
import type { SelectOption } from '@/lib/utils';
import type { Appointment, AppointmentStatus } from '@/types/appointments_type';
import type { Currency, Invoice } from '@/types/billing_type';
import type { Doctor } from '@/types/doctors_type';
import type { Patient } from '@/types/patients_type';
import { WEEK_STARTS_ON } from '@/pages/appointments/presentation/calendar/calendar_constants';

// ---------- dates ----------

// Appointment times are stored as the clinic's local time, without offset
export const parseLocal = (value: string) => new Date(value);

// Record timestamps (invoice issue date, created_at) are stored in UTC but serialized without
// an offset: read them as UTC so they land on the right local day
export const parseUtc = (value: string) =>
  new Date(/(z|[+-]\d{2}:?\d{2})$/i.test(value) ? value : `${value}Z`);

const inRange = (date: Date, { from, to }: DateRange) =>
  date.getTime() >= from.getTime() && date.getTime() <= to.getTime();

// ---------- periods ----------

export type PeriodKey = 'month' | '30d' | '90d' | 'year';
export type DateRange = { from: Date; to: Date };
export type Bucket = 'day' | 'week' | 'month';
export type Period = DateRange & {
  key: PeriodKey;
  // Same length right before, for the deltas
  previous: DateRange;
  bucket: Bucket;
  // How the period reads in a sentence: "in September 2026", "than last month"
  name: string;
  previousName: string;
};

export const PERIOD_OPTIONS: { key: PeriodKey; label: string }[] = [
  { key: 'month', label: 'This month' },
  { key: '30d', label: 'Last 30 days' },
  { key: '90d', label: 'Last 90 days' },
  { key: 'year', label: 'This year' },
];

export function periodRange(key: PeriodKey, now: Date): Period {
  switch (key) {
    // Whole calendar periods include what is still scheduled for the rest of them
    case 'month': {
      const from = startOfMonth(now);
      const previousFrom = subMonths(from, 1);
      return {
        key, from, to: endOfMonth(now), bucket: 'day',
        name: format(from, 'MMMM yyyy'), previousName: 'last month',
        previous: { from: previousFrom, to: endOfMonth(previousFrom) },
      };
    }
    case 'year': {
      const from = startOfYear(now);
      const previousFrom = subYears(from, 1);
      return {
        key, from, to: endOfYear(now), bucket: 'month',
        name: format(from, 'yyyy'), previousName: 'last year',
        previous: { from: previousFrom, to: endOfYear(previousFrom) },
      };
    }
    // Rolling periods end today
    case '30d':
    case '90d': {
      const days = key === '30d' ? 30 : 90;
      const from = startOfDay(subDays(now, days - 1));
      return {
        key, from, to: endOfDay(now), bucket: key === '30d' ? 'day' : 'week',
        name: `the last ${days} days`, previousName: `the ${days} days before`,
        previous: { from: subDays(from, days), to: endOfDay(subDays(from, 1)) },
      };
    }
  }
}

// ---------- appointment outcomes ----------

export type OutcomeKey = 'attended' | 'no_show' | 'upcoming' | 'cancelled' | 'unrecorded';

// What happened with each appointment, in plain words. An open appointment (scheduled,
// confirmed, in progress) is "upcoming" until it ends, and "not recorded" once it has passed:
// nobody wrote down whether the patient came.
// Order is the categorical slot order (series-1..5), validated for adjacent use: it's also
// the stacking order. Each outcome keeps its slot, so its color never changes
export const OUTCOMES: { key: OutcomeKey; label: string; meaning: string; color: string }[] = [
  { key: 'attended', label: 'Came', meaning: 'the patient came to the appointment', color: 'var(--series-1)' },
  { key: 'no_show', label: "Didn't come", meaning: "the patient didn't come and didn't cancel", color: 'var(--series-2)' },
  { key: 'upcoming', label: 'Upcoming', meaning: "hasn't happened yet", color: 'var(--series-3)' },
  { key: 'cancelled', label: 'Cancelled', meaning: 'cancelled before the appointment', color: 'var(--series-4)' },
  {
    key: 'unrecorded', label: 'Not recorded', meaning: "already passed, but nobody recorded whether the patient came",
    color: 'var(--series-5)',
  },
];

const OPEN_STATUSES: AppointmentStatus[] = ['scheduled', 'confirmed', 'in_progress'];
const isOpen = (a: Appointment) => OPEN_STATUSES.includes(a.status);

export function outcomeOf(appointment: Appointment, now: Date): OutcomeKey {
  if (appointment.status === 'completed') return 'attended';
  if (appointment.status === 'no_show') return 'no_show';
  if (appointment.status === 'cancelled') return 'cancelled';
  return parseLocal(appointment.end_datetime).getTime() < now.getTime() ? 'unrecorded' : 'upcoming';
}

export const appointmentsIn = (appointments: Appointment[], range: DateRange) =>
  appointments.filter((a) => inRange(parseLocal(a.start_datetime), range));

export type OutcomeCounts = Record<OutcomeKey, number>;

const emptyOutcomes = (): OutcomeCounts => ({ attended: 0, no_show: 0, upcoming: 0, cancelled: 0, unrecorded: 0 });

export function outcomeCounts(appointments: Appointment[], now: Date): OutcomeCounts {
  const counts = emptyOutcomes();
  for (const a of appointments) counts[outcomeOf(a, now)] += 1;
  return counts;
}

export type AppointmentMetrics = {
  total: number;
  outcomes: OutcomeCounts;
  // Of the appointments whose result was recorded (came or didn't come); null without any
  attendanceRate: number | null;
  cancellationRate: number | null;
};

export function appointmentMetrics(appointments: Appointment[], now: Date): AppointmentMetrics {
  const outcomes = outcomeCounts(appointments, now);
  const resolved = outcomes.attended + outcomes.no_show;
  return {
    total: appointments.length,
    outcomes,
    attendanceRate: resolved > 0 ? outcomes.attended / resolved : null,
    cancellationRate: appointments.length > 0 ? outcomes.cancelled / appointments.length : null,
  };
}

export type TrendRow = OutcomeCounts & { key: string; label: string; total: number };

// Appointments per day / week / month of the period, split by outcome
export function outcomeTrend(appointments: Appointment[], period: Period, now: Date): TrendRow[] {
  const interval = { start: period.from, end: period.to };
  const starts =
    period.bucket === 'day'
      ? eachDayOfInterval(interval)
      : period.bucket === 'week'
        ? eachWeekOfInterval(interval, { weekStartsOn: WEEK_STARTS_ON })
        : eachMonthOfInterval(interval);
  const keyOf = (date: Date) =>
    period.bucket === 'day'
      ? format(date, 'yyyy-MM-dd')
      : period.bucket === 'week'
        ? format(startOfWeek(date, { weekStartsOn: WEEK_STARTS_ON }), 'yyyy-MM-dd')
        : format(date, 'yyyy-MM');
  const labelOf = (date: Date) =>
    period.bucket === 'month' ? format(date, 'MMM') : format(date, 'MMM d');

  const rows = new Map<string, TrendRow>(
    starts.map((start) => {
      const key = keyOf(start);
      return [key, { key, label: labelOf(start), total: 0, ...emptyOutcomes() }];
    }),
  );
  for (const a of appointments) {
    const row = rows.get(keyOf(parseLocal(a.start_datetime)));
    if (!row) continue;
    row[outcomeOf(a, now)] += 1;
    row.total += 1;
  }
  return [...rows.values()];
}

// ---------- busiest times ----------

export const HEATMAP_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DEFAULT_FIRST_HOUR = 8;
const DEFAULT_LAST_HOUR = 17;

export type Heatmap = {
  hours: number[];
  // counts[weekday][hourIndex], weekday 0 = Sunday
  counts: number[][];
  max: number;
};

// When patients actually come: cancelled appointments don't take a slot
export function busiestTimes(appointments: Appointment[]): Heatmap {
  const kept = appointments.filter((a) => a.status !== 'cancelled').map((a) => parseLocal(a.start_datetime));
  const hoursSeen = kept.map((d) => d.getHours());
  const first = Math.min(DEFAULT_FIRST_HOUR, ...hoursSeen);
  const last = Math.max(DEFAULT_LAST_HOUR, ...hoursSeen);
  const hours = Array.from({ length: last - first + 1 }, (_, i) => first + i);
  const counts = HEATMAP_WEEKDAYS.map(() => hours.map(() => 0));
  for (const d of kept) counts[d.getDay()][d.getHours() - first] += 1;
  return { hours, counts, max: Math.max(0, ...counts.flat()) };
}

// ---------- categories ----------

export type CategoryRow = { key: string; label: string; value: number };

const labelFrom = (options: SelectOption<string>[] | undefined, value: string) =>
  humanizeKey(options?.find((o) => o.value === value)?.label ?? value);

export const humanizeKey = (value: string) => {
  const text = value.replaceAll('_', ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// Largest first; past `limit` the tail folds into "Other" instead of more rows
function rank(counts: Map<string, number>, labelOf: (key: string) => string, limit = Infinity): CategoryRow[] {
  const rows = [...counts.entries()]
    .map(([key, value]) => ({ key, label: labelOf(key), value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
  if (rows.length <= limit) return rows;
  const head = rows.slice(0, limit - 1);
  const other = rows.slice(limit - 1).reduce((sum, row) => sum + row.value, 0);
  return [...head, { key: 'other', label: 'Other', value: other }];
}

const countBy = <T,>(items: T[], keyOf: (item: T) => string) => {
  const counts = new Map<string, number>();
  for (const item of items) counts.set(keyOf(item), (counts.get(keyOf(item)) ?? 0) + 1);
  return counts;
};

export const appointmentTypes = (appointments: Appointment[], options?: SelectOption<string>[]) =>
  rank(countBy(appointments, (a) => a.type), (key) => labelFrom(options, key));

export function appointmentsBySpecialty(
  appointments: Appointment[],
  doctors: Doctor[],
  options?: SelectOption<string>[],
) {
  const specialtyOf = new Map(doctors.map((d) => [d.id, d.specialty]));
  return rank(
    countBy(appointments, (a) => specialtyOf.get(a.doctor_id) ?? 'unknown'),
    (key) => (key === 'unknown' ? 'Unknown doctor' : labelFrom(options, key)),
  );
}

// ---------- billing ----------

// Voiding sets both statuses; either one alone still means the invoice bills nothing
export const isVoided = (invoice: Invoice) =>
  invoice.payment_status === 'voided' || invoice.sin_status === 'voided';

// Money is summed in cents: the amounts are decimal strings ("150.00")
const cents = (value: string) => Math.round(parseFloat(value || '0') * 100);

export type CurrencyTotals = {
  currency: Currency;
  invoices: number;
  invoiced: number;
  collected: number;
  outstanding: number;
};

export const invoicesIn = (invoices: Invoice[], range: DateRange) =>
  invoices.filter((i) => inRange(parseUtc(i.issue_date), range));

// Amounts are never added across currencies: one total per currency
export function billingTotals(invoices: Invoice[]): CurrencyTotals[] {
  const totals = new Map<Currency, CurrencyTotals>();
  for (const invoice of invoices) {
    if (isVoided(invoice)) continue;
    const row = totals.get(invoice.currency) ?? {
      currency: invoice.currency, invoices: 0, invoiced: 0, collected: 0, outstanding: 0,
    };
    row.invoices += 1;
    row.invoiced += cents(invoice.total);
    row.collected += cents(invoice.amount_paid);
    row.outstanding = row.invoiced - row.collected;
    totals.set(invoice.currency, row);
  }
  // Cents back to units, larger currency first
  return [...totals.values()]
    .map((row) => ({
      ...row,
      invoiced: row.invoiced / 100,
      collected: row.collected / 100,
      outstanding: row.outstanding / 100,
    }))
    .sort((a, b) => b.invoices - a.invoices);
}

export const paymentMethods = (invoices: Invoice[], options?: SelectOption<string>[]) =>
  rank(countBy(invoices.filter((i) => !isVoided(i)), (i) => i.payment_method), (key) => labelFrom(options, key));

// ---------- patients ----------

export const AGE_BANDS: { label: string; min: number; max: number }[] = [
  { label: '0–17', min: 0, max: 17 },
  { label: '18–29', min: 18, max: 29 },
  { label: '30–44', min: 30, max: 44 },
  { label: '45–59', min: 45, max: 59 },
  { label: '60–74', min: 60, max: 74 },
  { label: '75+', min: 75, max: Infinity },
];

export function ageBands(patients: Patient[], now: Date): CategoryRow[] {
  const rows = AGE_BANDS.map((band) => ({ key: band.label, label: band.label, value: 0 }));
  for (const p of patients) {
    const age = differenceInYears(now, parseLocal(p.date_of_birth));
    const index = AGE_BANDS.findIndex((band) => age >= band.min && age <= band.max);
    if (index >= 0) rows[index].value += 1;
  }
  return rows;
}

// The data holds both codes ("M") and words ("Male")
const SEX_LABELS: Record<string, string> = { m: 'Male', male: 'Male', f: 'Female', female: 'Female', other: 'Other' };
export const patientsBySex = (patients: Patient[]) =>
  rank(countBy(patients, (p) => SEX_LABELS[String(p.sex).toLowerCase()] ?? 'Not recorded'), (key) => key);

export const insuranceCoverage = (patients: Patient[]) =>
  rank(
    countBy(patients, (p) => {
      const type = p.health_insurance?.type?.trim();
      if (!type) return 'Not recorded';
      if (type.toLowerCase() === 'none') return 'Uninsured';
      return type.length <= 4 ? type.toUpperCase() : humanizeKey(type);
    }),
    (key) => key,
  );

// Patients seen in the period (an appointment that wasn't cancelled), split by whether it was
// their first time at the clinic: no earlier appointment that wasn't cancelled
export function patientsSeenSplit(appointments: Appointment[], range: DateRange) {
  const seen = new Set<string>();
  const before = new Set<string>();
  for (const a of appointments) {
    if (a.status === 'cancelled') continue;
    const start = parseLocal(a.start_datetime).getTime();
    if (start < range.from.getTime()) before.add(a.patient_id);
    else if (start <= range.to.getTime()) seen.add(a.patient_id);
  }
  const returning = [...seen].filter((id) => before.has(id)).length;
  return { seen: seen.size, firstTime: seen.size - returning, returning };
}

// ---------- today ----------

export type TodaySummary = {
  total: number;
  attended: number;
  noShow: number;
  cancelled: number;
  // Still to come today
  remaining: number;
  next: Appointment | null;
  nextWeek: number;
};

export function todaySummary(appointments: Appointment[], now: Date): TodaySummary {
  const today = appointments.filter((a) => isSameDay(parseLocal(a.start_datetime), now));
  const upcoming = today
    .filter((a) => isOpen(a) && parseLocal(a.start_datetime).getTime() >= now.getTime())
    .sort((a, b) => parseLocal(a.start_datetime).getTime() - parseLocal(b.start_datetime).getTime());
  const weekEnd = endOfDay(subDays(now, -7));
  return {
    total: today.length,
    attended: today.filter((a) => a.status === 'completed').length,
    noShow: today.filter((a) => a.status === 'no_show').length,
    cancelled: today.filter((a) => a.status === 'cancelled').length,
    remaining: upcoming.length,
    next: upcoming[0] ?? null,
    nextWeek: appointments.filter((a) => {
      const start = parseLocal(a.start_datetime);
      return isOpen(a) && start.getTime() > now.getTime() && start.getTime() <= weekEnd.getTime();
    }).length,
  };
}

// ---------- formatting ----------

// Whole percentages read faster; below 1% keeps one decimal so a few cases don't show as 0%
export const formatPercent = (value: number | null) => {
  if (value === null) return '—';
  const percent = value * 100;
  return percent > 0 && percent < 1 ? `${percent.toFixed(1)}%` : `${Math.round(percent)}%`;
};

// Whole amounts: at a glance, cents only add noise ("BOB 1,997,491")
export const formatAmount = (value: number, currency: string) =>
  `${currency} ${Math.round(value).toLocaleString('en-US')}`;

export const formatCount = (value: number, singular: string, plural = `${singular}s`) =>
  `${value.toLocaleString('en-US')} ${value === 1 ? singular : plural}`;
