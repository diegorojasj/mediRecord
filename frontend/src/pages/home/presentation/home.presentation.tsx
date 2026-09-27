import { format } from 'date-fns';
import { RefreshCw } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn, type SelectOption } from '@/lib/utils';
import type { Appointment } from '@/types/appointments_type';
import type { Invoice } from '@/types/billing_type';
import type { Doctor } from '@/types/doctors_type';
import type { Patient } from '@/types/patients_type';
import { BusiestTimesChart } from './charts/busiestTimesChart';
import { CategoryBarChart } from './charts/categoryBarChart';
import { CollectionMeters } from './charts/collectionMeters';
import { OutcomeTrendChart } from './charts/outcomeTrendChart';
import { PatientsSeenMeter } from './charts/patientsSeenMeter';
import { PeriodComparisonChart } from './charts/periodComparisonChart';
import { TodayPanel } from './charts/todayPanel';
import './dashboard.css';
import {
  ageBands,
  appointmentMetrics,
  appointmentsBySpecialty,
  appointmentsIn,
  appointmentTypes,
  billingTotals,
  busiestTimes,
  insuranceCoverage,
  invoicesIn,
  outcomeTrend,
  patientsBySex,
  patientsSeenSplit,
  paymentMethods,
  PERIOD_OPTIONS,
  periodRange,
  todaySummary,
  type PeriodKey,
} from './home_functions';
import {
  ageTakeaway,
  busiestBucketTakeaway,
  busiestTimeTakeaway,
  CHARTS,
  collectionTakeaway,
  comparisonTakeaway,
  insuranceTakeaway,
  patientsSeenTakeaway,
  summaryStats,
  topCategoryTakeaway,
} from './home_insights';

export type DashboardData = {
  appointments: Appointment[];
  invoices: Invoice[];
  patients: Patient[];
  doctors: Doctor[];
};

export type DashboardOptions = {
  appointmentType: SelectOption<string>[];
  paymentMethod: SelectOption<string>[];
  specialty: SelectOption<string>[];
};

// index.css styles h1/h2 globally (unlayered), so headings need the ! overrides
const SECTION_HEADING = '!m-0 !font-sans !text-base !font-semibold !leading-snug !tracking-normal !text-foreground';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className={SECTION_HEADING}>{title}</h2>
      {children}
    </section>
  );
}

const scrollToChart = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

const HomePresentation = ({
  data,
  options,
  failedSources,
  loading,
  onRefresh,
  now,
}: {
  data: DashboardData;
  options: DashboardOptions;
  // Sources that couldn't be loaded; the rest of the dashboard still shows
  failedSources: string[];
  loading: boolean;
  onRefresh: () => void;
  now: Date;
}) => {
  const [periodKey, setPeriodKey] = useState<PeriodKey>('month');
  const period = periodRange(periodKey, now);

  const appointments = appointmentsIn(data.appointments, period);
  const metrics = appointmentMetrics(appointments, now);
  const previousMetrics = appointmentMetrics(appointmentsIn(data.appointments, period.previous), now);
  const trend = outcomeTrend(appointments, period, now);
  const heatmap = busiestTimes(appointments);

  const invoices = invoicesIn(data.invoices, period);
  const totals = billingTotals(invoices);

  // Demographics of the patients the clinic actually saw in the period
  const patientsSeen = patientsSeenSplit(data.appointments, period);
  const seenIds = new Set(appointments.filter((a) => a.status !== 'cancelled').map((a) => a.patient_id));
  const seenPatients = data.patients.filter((p) => seenIds.has(p.id));

  const types = appointmentTypes(appointments, options.appointmentType);
  const specialties = appointmentsBySpecialty(appointments, data.doctors, options.specialty);
  const methods = paymentMethods(invoices, options.paymentMethod);
  const ages = ageBands(seenPatients, now);
  const insurance = insuranceCoverage(seenPatients);
  const sexes = patientsBySex(seenPatients);

  const patientNames = new Map(data.patients.map((p) => [p.id, `${p.first_name} ${p.first_surname}`]));
  const doctorNames = new Map(data.doctors.map((d) => [d.id, `Dr. ${d.first_name} ${d.first_surname}`]));
  const nameOf = (kind: 'patient' | 'doctor', id: string) =>
    (kind === 'patient' ? patientNames : doctorNames).get(id) ?? `${kind === 'patient' ? 'Patient' : 'Doctor'} ${id.slice(-6)}`;

  const sameYear = period.from.getFullYear() === period.to.getFullYear();
  const rangeLabel = `${format(period.from, sameYear ? 'MMMM d' : 'MMMM d, yyyy')} to ${format(period.to, 'MMMM d, yyyy')}`;
  const summary = summaryStats({
    previousName: period.previousName,
    metrics,
    previous: previousMetrics,
    totals,
    patients: patientsSeen,
    heatmap,
  });

  return (
    <div className="viz-root mx-auto flex w-full max-w-7xl flex-col gap-4 pb-6 text-left">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="!m-0 !font-sans !text-xl !font-semibold !tracking-normal !text-foreground">Dashboard</h1>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={cn('size-3.5', loading && 'animate-spin')} />
          Update
        </Button>
      </header>

      {failedSources.length > 0 && (
        <p className="m-0 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          Could not load the {failedSources.join(', ')}. The numbers that depend on them may be incomplete.
        </p>
      )}

      {/* Refetching keeps the previous render, dimmed, instead of flashing a skeleton */}
      <div className={cn('flex flex-col gap-6 transition-opacity', loading && 'opacity-60')}>
        <TodayPanel summary={todaySummary(data.appointments, now)} now={now} nameOf={nameOf} />

        <div className="flex flex-col gap-4">
          {/* One filter row, scoping everything below it */}
          <div className="flex flex-col gap-2 border-t pt-5">
            <h2 className={SECTION_HEADING}>What happened in {period.name}?</h2>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-muted-foreground">Show:</span>
              <div role="radiogroup" aria-label="Period" className="inline-flex flex-wrap rounded-md border bg-card p-0.5">
                {PERIOD_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    role="radio"
                    aria-checked={periodKey === option.key}
                    onClick={() => setPeriodKey(option.key)}
                    className={cn(
                      'rounded px-3 py-1 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
                      periodKey === option.key
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">From {rangeLabel}</span>
            </div>
          </div>

          {/* Headline results; each tile jumps to the one chart that shows it */}
          <section aria-label="In short" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {summary.map((stat) => (
              <button
                key={stat.label}
                type="button"
                onClick={() => scrollToChart(stat.chart.id)}
                className="flex min-w-0 flex-col rounded-md border bg-card px-3 py-2.5 text-left transition hover:border-foreground/30 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              >
                <span className="truncate text-xs text-muted-foreground">{stat.label}</span>
                <span
                  className={cn(
                    'mt-1 truncate text-xl font-semibold leading-tight tabular-nums',
                    stat.trend === 'up'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : stat.trend === 'down'
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-foreground',
                  )}
                >
                  {stat.value}
                </span>
                {stat.detail && <span className="mt-0.5 truncate text-[11px] text-muted-foreground">{stat.detail}</span>}
                <span className="sr-only">. See chart: {stat.chart.name}</span>
              </button>
            ))}
          </section>
        </div>

        <Section title="Appointments">
          <OutcomeTrendChart
            id={CHARTS.outcomes.id}
            rows={trend}
            totals={metrics.outcomes}
            bucketLabel={period.bucket}
            takeaway={busiestBucketTakeaway(trend, period.bucket)}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <PeriodComparisonChart
              id={CHARTS.comparison.id}
              current={metrics}
              previous={previousMetrics}
              currentName={period.name}
              previousName={period.previousName}
              takeaway={comparisonTakeaway(metrics, previousMetrics, period.previousName)}
            />
            <BusiestTimesChart id={CHARTS.busiest.id} heatmap={heatmap} takeaway={busiestTimeTakeaway(heatmap)} />
            <CategoryBarChart
              title="Appointment types"
              takeaway={topCategoryTakeaway(types)}
              rows={types}
              valueLabel="Appointments"
            />
            <CategoryBarChart
              title="By specialty"
              takeaway={topCategoryTakeaway(specialties, 'Most requested')}
              rows={specialties}
              valueLabel="Appointments"
              labelWidth={170}
              limit={7}
            />
          </div>
        </Section>

        <Section title="Money">
          <div className="grid gap-4 lg:grid-cols-2">
            <CollectionMeters id={CHARTS.collection.id} totals={totals} takeaway={collectionTakeaway(totals)} />
            <CategoryBarChart
              title="Payment methods"
              subtitle="Voided invoices excluded"
              takeaway={topCategoryTakeaway(methods, 'Most used')}
              rows={methods}
              valueLabel="Invoices"
              emptyMessage="No invoices in this period"
            />
          </div>
        </Section>

        <Section title="Patients seen">
          <div className="grid gap-4 lg:grid-cols-2">
            <PatientsSeenMeter
              id={CHARTS.patientsSeen.id}
              patients={patientsSeen}
              takeaway={patientsSeenTakeaway(patientsSeen)}
            />
            <CategoryBarChart
              title="Age (years)"
              takeaway={ageTakeaway(ages)}
              rows={ages}
              valueLabel="Patients"
              orientation="vertical"
            />
            <CategoryBarChart
              title="Health insurance"
              takeaway={insuranceTakeaway(insurance)}
              rows={insurance}
              valueLabel="Patients"
              labelWidth={100}
            />
            <CategoryBarChart
              title="Sex"
              takeaway={topCategoryTakeaway(sexes, 'Most patients')}
              rows={sexes}
              valueLabel="Patients"
              labelWidth={80}
            />
          </div>
        </Section>
      </div>
    </div>
  );
};

export default HomePresentation;
