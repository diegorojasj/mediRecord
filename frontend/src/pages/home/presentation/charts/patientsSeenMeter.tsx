import { formatCount, formatPercent } from '../home_functions';
import { ChartCard } from './chartParts';

// One ratio, so a meter: the fill is the patients seen for the first time, the lighter track
// of the same ramp the ones who had come before. Supports the "patients seen" sentence
export function PatientsSeenMeter({
  id,
  patients,
  takeaway,
}: {
  id: string;
  patients: { seen: number; firstTime: number; returning: number };
  takeaway?: string;
}) {
  const ratio = patients.seen > 0 ? patients.firstTime / patients.seen : 0;

  return (
    <ChartCard
      id={id}
      title="Were they new or had they come before?"
      subtitle="All the different patients seen in this period. The filled part is those who came for the first time."
      takeaway={takeaway}
      table={{
        columns: ['Patients', 'Count', 'Share'],
        rows: [
          ['First time', patients.firstTime, formatPercent(patients.seen > 0 ? patients.firstTime / patients.seen : null)],
          ['Had come before', patients.returning, formatPercent(patients.seen > 0 ? patients.returning / patients.seen : null)],
          ['Total seen', patients.seen, '100%'],
        ],
      }}
    >
      {patients.seen === 0 ? (
        <p className="py-8 text-center text-xs text-muted-foreground">No patients were seen in this period</p>
      ) : (
        <div>
          <p className="m-0 text-3xl font-semibold text-foreground">{patients.seen}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">different patients seen</p>
          <div
            className="mt-4 h-3 overflow-hidden rounded-full"
            style={{ background: 'var(--meter-track)' }}
            role="meter"
            aria-valuemin={0}
            aria-valuemax={patients.seen}
            aria-valuenow={patients.firstTime}
            aria-label="Patients seen for the first time"
          >
            <div className="h-full rounded-full" style={{ width: `${ratio * 100}%`, background: 'var(--meter-fill)' }} />
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div>
              <dt className="flex items-center gap-1.5 text-muted-foreground">
                <span className="size-2.5 rounded-sm" style={{ background: 'var(--meter-fill)' }} />
                First time
              </dt>
              <dd className="m-0 mt-0.5 text-sm font-semibold text-foreground">
                {formatCount(patients.firstTime, 'patient')} · {formatPercent(ratio)}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-muted-foreground">
                <span className="size-2.5 rounded-sm border" style={{ background: 'var(--meter-track)' }} />
                Had come before
              </dt>
              <dd className="m-0 mt-0.5 text-sm font-semibold text-foreground">
                {formatCount(patients.returning, 'patient')} · {formatPercent(1 - ratio)}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </ChartCard>
  );
}
