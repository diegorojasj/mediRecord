import { format } from 'date-fns';
import { hourLabel } from '@/pages/appointments/presentation/calendar/calendar_functions';
import {
  formatAmount,
  formatCount,
  formatPercent,
  HEATMAP_WEEKDAYS,
  type AppointmentMetrics,
  type CategoryRow,
  type CurrencyTotals,
  type Heatmap,
  type Period,
  type TrendRow,
} from './home_functions';

// Plain-language readings of the numbers, for people who don't read charts every day.
// Each one says in a sentence what the chart next to it shows

const share = (value: number, total: number) => (total > 0 ? formatPercent(value / total) : '—');

const WEEKDAY_NAMES = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];

// Every sentence names the one chart that shows it, so the summary and the charts never
// disagree and no chart is there without a reason
export const CHARTS = {
  outcomes: { id: 'chart-outcomes', name: 'Appointments each day' },
  comparison: { id: 'chart-comparison', name: 'Compared with before' },
  collection: { id: 'chart-collection', name: 'Money' },
  patientsSeen: { id: 'chart-patients-seen', name: 'Patients seen' },
  busiest: { id: 'chart-busiest', name: 'When do patients come' },
} as const;

export type SummarySentence = { text: string; chart: (typeof CHARTS)[keyof typeof CHARTS] };

export function summarySentences({
  period,
  metrics,
  previous,
  totals,
  patients,
  heatmap,
}: {
  period: Period;
  metrics: AppointmentMetrics;
  previous: AppointmentMetrics;
  totals: CurrencyTotals[];
  patients: { seen: number; firstTime: number; returning: number };
  heatmap: Heatmap;
}): SummarySentence[] {
  const { total, outcomes } = metrics;
  if (total === 0) return [{ text: `There are no appointments in ${period.name}.`, chart: CHARTS.outcomes }];

  const sentences: SummarySentence[] = [];
  const say = (text: string, chart: SummarySentence['chart']) => sentences.push({ text, chart });
  const were = (count: number) => (count === 1 ? 'was' : 'were');

  const upcoming =
    outcomes.upcoming > 0
      ? ` ${outcomes.upcoming} of them ${outcomes.upcoming === 1 ? "hasn't" : "haven't"} happened yet.`
      : '';
  say(`${formatCount(total, 'appointment')} ${were(total)} booked for ${period.name}.${upcoming}`, CHARTS.outcomes);

  const resolved = outcomes.attended + outcomes.no_show;
  if (resolved > 0) {
    say(
      `Of the ${formatCount(resolved, 'appointment')} with a recorded result, ` +
        `${formatCount(outcomes.attended, 'patient')} came (${share(outcomes.attended, resolved)}) and ` +
        `${outcomes.no_show} didn't come (${share(outcomes.no_show, resolved)}).`,
      CHARTS.outcomes,
    );
  }
  if (outcomes.unrecorded > 0) {
    say(`For ${formatCount(outcomes.unrecorded, 'past appointment')}, nobody recorded yet whether the patient came.`, CHARTS.outcomes);
  }
  if (outcomes.cancelled > 0) {
    say(`${formatCount(outcomes.cancelled, 'appointment')} ${were(outcomes.cancelled)} cancelled (${share(outcomes.cancelled, total)} of all).`, CHARTS.outcomes);
  }

  if (previous.total > 0) {
    const change = Math.round(((total - previous.total) / previous.total) * 100);
    const volume =
      change === 0
        ? `about the same number of appointments as ${period.previousName} (${previous.total})`
        : `${Math.abs(change)}% ${change > 0 ? 'more' : 'fewer'} appointments than ${period.previousName} (${previous.total})`;
    const came =
      metrics.attendanceRate !== null && previous.attendanceRate !== null
        ? `, and ${formatPercent(metrics.attendanceRate)} of patients came (${formatPercent(previous.attendanceRate)} ${period.previousName})`
        : '';
    say(`There were ${volume}${came}.`, CHARTS.comparison);
  }

  if (totals.length > 0) {
    const received = totals.map((row) => formatAmount(row.collected, row.currency)).join(' and ');
    const owed = totals.filter((row) => row.outstanding > 0).map((row) => formatAmount(row.outstanding, row.currency));
    say(`The clinic received ${received}${owed.length ? `; ${owed.join(' and ')} ${owed.length === 1 ? 'is' : 'are'} still owed` : ''}.`, CHARTS.collection);
  }

  if (patients.seen > 0) {
    say(
      `${formatCount(patients.seen, 'different patient')} ${were(patients.seen)} seen: ` +
        `${patients.firstTime} for the first time and ${patients.returning} who had come before.`,
      CHARTS.patientsSeen,
    );
  }

  const busiest = busiestSlot(heatmap);
  if (busiest) say(`The busiest time was ${busiest.day} at ${busiest.hour}.`, CHARTS.busiest);
  return sentences;
}

export function busiestSlot({ hours, counts, max }: Heatmap) {
  if (max === 0) return null;
  for (let day = 0; day < counts.length; day++) {
    const hourIndex = counts[day].indexOf(max);
    if (hourIndex >= 0) {
      return { day: WEEKDAY_NAMES[day], shortDay: HEATMAP_WEEKDAYS[day], hour: hourLabel(hours[hourIndex]), count: max };
    }
  }
  return null;
}

export const busiestTimeTakeaway = (heatmap: Heatmap) => {
  const slot = busiestSlot(heatmap);
  return slot ? `Busiest time: ${slot.day} at ${slot.hour} (${formatCount(slot.count, 'appointment')}).` : undefined;
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
  return `Busiest ${bucket}: ${when}, with ${formatCount(top.total, 'appointment')}.`;
}

// "Most common: Teleconsult — 20 appointments (27%)."
export function topCategoryTakeaway(rows: CategoryRow[], noun: string, lead = 'Most common') {
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  const top = rows.find((row) => row.key !== 'other');
  if (!top || total === 0) return undefined;
  return `${lead}: ${top.label} — ${formatCount(top.value, noun)} (${share(top.value, total)}).`;
}

export function ageTakeaway(rows: CategoryRow[]) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  const top = [...rows].sort((a, b) => b.value - a.value)[0];
  if (!top || total === 0) return undefined;
  return `Most patients are ${top.label} years old (${share(top.value, total)}).`;
}

const NOT_INSURED = new Set(['Not recorded', 'Uninsured']);

export function insuranceTakeaway(rows: CategoryRow[]) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  if (total === 0) return undefined;
  const insured = rows.filter((row) => !NOT_INSURED.has(row.label)).reduce((sum, row) => sum + row.value, 0);
  const unknown = rows.find((row) => row.label === 'Not recorded')?.value ?? 0;
  const note = unknown > 0 ? ` For ${formatCount(unknown, 'patient')} it isn't recorded.` : '';
  return `${share(insured, total)} of the patients have health insurance.${note}`;
}

export function collectionTakeaway(totals: CurrencyTotals[]) {
  if (totals.length === 0) return undefined;
  return totals
    .map((row) => `${row.currency}: ${share(row.collected, row.invoiced)} of what was billed has been paid.`)
    .join(' ');
}

export function comparisonTakeaway(current: AppointmentMetrics, previous: AppointmentMetrics, previousName: string) {
  if (previous.total === 0) return `There were no appointments ${previousName} to compare with.`;
  const change = Math.round(((current.total - previous.total) / previous.total) * 100);
  const volume = change === 0 ? `About as many appointments as ${previousName}` : `${Math.abs(change)}% ${change > 0 ? 'more' : 'fewer'} appointments than ${previousName}`;
  const came =
    current.attendanceRate !== null && previous.attendanceRate !== null
      ? `; patients who came went from ${formatPercent(previous.attendanceRate)} to ${formatPercent(current.attendanceRate)}`
      : '';
  return `${volume}${came}.`;
}

export function patientsSeenTakeaway({ seen, firstTime }: { seen: number; firstTime: number }) {
  if (seen === 0) return undefined;
  return `${share(firstTime, seen)} of the patients came for the first time.`;
}
