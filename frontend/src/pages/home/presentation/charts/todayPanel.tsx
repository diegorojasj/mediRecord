import { format } from 'date-fns';
import type { TodaySummary } from '../home_functions';
import { parseLocal } from '../home_functions';

export function TodayPanel({
  summary,
  now,
  nameOf,
}: {
  summary: TodaySummary;
  now: Date;
  nameOf: (kind: 'patient' | 'doctor', id: string) => string;
}) {
  const next = summary.next;
  return (
    <section className="grid min-w-0 gap-4 rounded-md border bg-card p-4 md:grid-cols-[auto_minmax(0,1fr)] lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,1.2fr)] lg:items-center lg:gap-8">
      <div>
        <p className="m-0 text-xs text-muted-foreground">Today · {format(now, 'EEEE, MMMM d')}</p>
        {/* The one figure the dashboard leads with */}
        <p className="m-0 mt-2 text-5xl font-semibold leading-none text-foreground">{summary.total}</p>
        <p className="mt-1 text-xs text-muted-foreground">{summary.total === 1 ? 'appointment' : 'appointments'} today</p>
      </div>
      <dl className="m-0 grid grid-cols-4 gap-x-4 text-xs md:self-end lg:self-center">
        {[
          ['Still to come', summary.remaining],
          ['Came', summary.attended],
          ["Didn't come", summary.noShow],
          ['Cancelled', summary.cancelled],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="whitespace-nowrap text-muted-foreground">{label}</dt>
            <dd className="m-0 text-base font-semibold text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="rounded-md border bg-muted/30 px-3 py-2 text-xs md:col-span-2 lg:col-span-1">
        {next ? (
          <p className="m-0 text-muted-foreground">
            Next patient at <span className="font-semibold text-foreground">{format(parseLocal(next.start_datetime), 'h:mm a')}</span>{' '}
            · {nameOf('patient', next.patient_id)} with {nameOf('doctor', next.doctor_id)}
          </p>
        ) : (
          <p className="m-0 text-muted-foreground">No more patients are expected today</p>
        )}
        <p className="m-0 mt-0.5 text-muted-foreground">
          {summary.nextWeek} {summary.nextWeek === 1 ? 'appointment is' : 'appointments are'} booked for the next 7 days
        </p>
      </div>
    </section>
  );
}
