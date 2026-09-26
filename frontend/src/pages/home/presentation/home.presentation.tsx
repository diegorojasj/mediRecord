import { format } from 'date-fns';
import { ArrowDown, RefreshCw } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn, type SelectOption } from '@/lib/utils';
import type { Appointment } from '@/types/appointments_type';
import type { Invoice } from '@/types/billing_type';
import type { Doctor } from '@/types/doctors_type';
import type { Patient } from '@/types/patients_type';
import { BusiestTimesHeatmap } from './charts/busiestTimesHeatmap';
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
  summarySentences,
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

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className={SECTION_HEADING}>{title}</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
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
  const summary = summarySentences({
    period,
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
          <p className="mt-0.5 text-xs text-muted-foreground">A summary of the clinic’s appointments, money and patients.</p>
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

          {/* The summary in words; each sentence points to the one chart that shows it */}
          <section className="rounded-md border bg-card p-4">
            <h2 className={SECTION_HEADING}>In short</h2>
            <ul className="m-0 mt-2 list-disc space-y-1.5 pl-5 text-sm text-foreground marker:text-muted-foreground">
              {summary.map((sentence) => (
                <li key={sentence.text}>
                  {sentence.text}{' '}
                  <button
                    type="button"
                    className="inline-flex items-center gap-0.5 whitespace-nowrap rounded px-1 text-xs text-muted-foreground underline-offset-2 transition hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                    onClick={() => scrollToChart(sentence.chart.id)}
                  >
                    <ArrowDown className="size-3" aria-hidden />
                    See chart
                    <span className="sr-only">: {sentence.chart.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <Section title="Appointments" description="How many appointments there were, what happened with them, and when patients come.">
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
            <BusiestTimesHeatmap id={CHARTS.busiest.id} heatmap={heatmap} takeaway={busiestTimeTakeaway(heatmap)} />
            <CategoryBarChart
              title="What kind of appointments were they?"
              subtitle="Each bar is a type of appointment. The longer the bar, the more appointments of that type."
              takeaway={topCategoryTakeaway(types, 'appointment')}
              rows={types}
              valueLabel="Appointments"
            />
            <CategoryBarChart
              title="Which specialties had the most appointments?"
              subtitle="Appointments grouped by the specialty of the doctor who attended them."
              takeaway={topCategoryTakeaway(specialties, 'appointment', 'Most requested')}
              rows={specialties}
              valueLabel="Appointments"
              labelWidth={170}
              limit={7}
            />
          </div>
        </Section>

        <Section title="Money" description="What was billed in this period, how much has been paid and how patients pay.">
          <div className="grid gap-4 lg:grid-cols-2">
            <CollectionMeters id={CHARTS.collection.id} totals={totals} takeaway={collectionTakeaway(totals)} />
            <CategoryBarChart
              title="How do patients pay?"
              subtitle="Invoices by payment method. Cancelled (voided) invoices are not counted."
              takeaway={topCategoryTakeaway(methods, 'invoice', 'Most used')}
              rows={methods}
              valueLabel="Invoices"
              emptyMessage="No invoices in this period"
            />
          </div>
        </Section>

        <Section title="Patients" description="Who the patients seen in this period are: everyone with an appointment that wasn't cancelled.">
          <div className="grid gap-4 lg:grid-cols-2">
            <PatientsSeenMeter
              id={CHARTS.patientsSeen.id}
              patients={patientsSeen}
              takeaway={patientsSeenTakeaway(patientsSeen)}
            />
            <CategoryBarChart
              title="How old are they?"
              subtitle="Patients by age group, in years."
              takeaway={ageTakeaway(ages)}
              rows={ages}
              valueLabel="Patients"
              orientation="vertical"
            />
            <CategoryBarChart
              title="Do they have health insurance?"
              subtitle="Patients by type of health insurance."
              takeaway={insuranceTakeaway(insurance)}
              rows={insurance}
              valueLabel="Patients"
              labelWidth={100}
            />
            <CategoryBarChart
              title="Men and women"
              subtitle="Patients by sex."
              takeaway={topCategoryTakeaway(sexes, 'patient', 'Most patients')}
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
