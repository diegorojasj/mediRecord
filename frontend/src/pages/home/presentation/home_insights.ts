import { format } from 'date-fns';
import { hourLabel } from '@/pages/appointments/presentation/calendar/calendar_functions';
import {
  formatAmount,
  formatCount,
  formatPercent,
  busiestDaysAndHours,
  type AppointmentMetrics,
  type CategoryRow,
  type CurrencyTotals,
  type Heatmap,
  type Period,
  type TrendRow,
} from './home_functions';

// Short plain-language results for the charts: the number first, no explanations.
// Each one states what the chart next to it shows

const share = (value: number, total: number) => (total > 0 ? formatPercent(value / total) : '—');

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Every summary stat names the one chart that shows it, so the summary and the charts never
// disagree and no chart is there without a reason
export const CHARTS = {
  outcomes: { id: 'chart-outcomes', name: 'Appointments each day' },
  comparison: { id: 'chart-comparison', name: 'Compared with before' },
  collection: { id: 'chart-collection', name: 'Money' },
  patientsSeen: { id: 'chart-patients-seen', name: 'Patients seen' },
  busiest: { id: 'chart-busiest', name: 'When do patients come' },
} as const;

// A headline number for the "In short" row: the result first, a short detail under it
export type SummaryStat = {
  label: string;
  value: string;
  detail?: string;
  // Direction of a change against the previous period, colors the detail
  trend?: 'up' | 'down';
  chart: (typeof CHARTS)[keyof typeof CHARTS];
};

export function summaryStats({
  previousName,
  metrics,
  previous,
  totals,
  patients,
  heatmap,
}: {
  previousName: string;
  metrics: AppointmentMetrics;
  previous: AppointmentMetrics;
  totals: CurrencyTotals[];
  patients: { seen: number; firstTime: number; returning: number };
  heatmap: Heatmap;
}): SummaryStat[] {
  const { total, outcomes } = metrics;
  const stats: SummaryStat[] = [];

  const pending = [
    outcomes.upcoming > 0 && `${outcomes.upcoming} upcoming`,
    outcomes.cancelled > 0 && `${outcomes.cancelled} cancelled`,
  ].filter(Boolean);
  stats.push({ label: 'Appointments', value: total.toLocaleString('en-US'), detail: pending.join(' · ') || undefined, chart: CHARTS.outcomes });
  if (total === 0) return stats;

  if (previous.total > 0) {
    const difference = total - previous.total;
    stats.push({
      label: `vs. ${previousName}`,
      value: difference === 0 ? 'Same' : `${Math.abs(difference)} ${difference > 0 ? 'more' : 'fewer'}`,
      detail: `${total} now · ${previous.total} before`,
      trend: difference > 0 ? 'up' : difference < 0 ? 'down' : undefined,
      chart: CHARTS.comparison,
    });
  }

  for (const row of totals) {
    stats.push({
      label: `Received (${row.currency})`,
      value: formatAmount(row.collected, row.currency),
      detail: row.outstanding > 0 ? `${formatAmount(row.outstanding, row.currency)} owed` : 'Nothing owed',
      chart: CHARTS.collection,
    });
  }

  if (patients.seen > 0) {
    stats.push({ label: 'Patients seen', value: String(patients.seen), detail: `${patients.firstTime} first time`, chart: CHARTS.patientsSeen });
  }

  const busiest = busiestDayAndHour(heatmap);
  if (busiest) {
    stats.push({ label: 'Busiest day', value: busiest.day, detail: `Most at ${busiest.hour}`, chart: CHARTS.busiest });
  }
  return stats;
}

// The busiest weekday and the busiest hour, read from the two rows of the chart
export function busiestDayAndHour(heatmap: Heatmap) {
  if (heatmap.max === 0) return null;
  const { days, hours } = busiestDaysAndHours(heatmap);
  const top = <T extends { count: number }>(bars: T[]) => bars.reduce((best, bar) => (bar.count > best.count ? bar : best));
  const day = top(days);
  const hour = top(hours);
  return { day: WEEKDAY_NAMES[day.day], hour: hourLabel(hour.hour) };
}

export const busiestTimeTakeaway = (heatmap: Heatmap) => {
  const busiest = busiestDayAndHour(heatmap);
  return busiest ? `Busiest: ${busiest.day} · around ${busiest.hour}` : undefined;
};

export function busiestBucketTakeaway(rows: TrendRow[], bucket: Period['bucket']) {
  const top = rows.reduce<TrendRow | null>((best, row) => (!best || row.total > best.total ? row : best), null);
  if (!top || top.total === 0) return undefined;
  // Row keys are "yyyy-MM-dd" (day, week start) or "yyyy-MM" (month)
  const start = new Date(`${top.key.length === 7 ? `${top.key}-01` : top.key}T00:00`);
  const when =
    bucket === 'day'
      ? format(start, 'EEEE, MMMM d')
      : bucket === 'week'
        ? `the week of ${format(start, 'MMMM d')}`
        : format(start, 'MMMM');
  return `Busiest ${bucket}: ${when} · ${formatCount(top.total, 'appointment')}`;
}

// "Most common: Teleconsult · 27%"
export function topCategoryTakeaway(rows: CategoryRow[], lead = 'Most common') {
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  const top = rows.find((row) => row.key !== 'other');
  if (!top || total === 0) return undefined;
  return `${lead}: ${top.label} · ${share(top.value, total)}`;
}

export function ageTakeaway(rows: CategoryRow[]) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  const top = [...rows].sort((a, b) => b.value - a.value)[0];
  if (!top || total === 0) return undefined;
  return `Most: ${top.label} years · ${share(top.value, total)}`;
}

const NOT_INSURED = new Set(['Not recorded', 'Uninsured']);

export function insuranceTakeaway(rows: CategoryRow[]) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  if (total === 0) return undefined;
  const insured = rows.filter((row) => !NOT_INSURED.has(row.label)).reduce((sum, row) => sum + row.value, 0);
  const unknown = rows.find((row) => row.label === 'Not recorded')?.value ?? 0;
  const note = unknown > 0 ? ` · ${unknown} not recorded` : '';
  return `${share(insured, total)} insured${note}`;
}

export function collectionTakeaway(totals: CurrencyTotals[]) {
  if (totals.length === 0) return undefined;
  return totals
    .map((row) => `${row.currency}: ${share(row.collected, row.invoiced)} paid`)
    .join(' · ');
}

export function comparisonTakeaway(current: AppointmentMetrics, previous: AppointmentMetrics, previousName: string) {
  if (previous.total === 0) return `No appointments ${previousName} to compare with`;
  // Counts, not percentages: "8 more appointments" reads at a glance, "−11%" doesn't
  const difference = current.total - previous.total;
  const volume =
    difference === 0
      ? `Same number of appointments as ${previousName}`
      : `${formatCount(Math.abs(difference), `${difference > 0 ? 'more' : 'fewer'} appointment`)} than ${previousName}`;
  const came =
    current.attendanceRate !== null && previous.attendanceRate !== null
      ? ` · came ${formatPercent(previous.attendanceRate)} → ${formatPercent(current.attendanceRate)}`
      : '';
  return `${volume}${came}`;
}

export function patientsSeenTakeaway({ seen, firstTime }: { seen: number; firstTime: number }) {
  if (seen === 0) return undefined;
  return `${share(firstTime, seen)} first time`;
}
