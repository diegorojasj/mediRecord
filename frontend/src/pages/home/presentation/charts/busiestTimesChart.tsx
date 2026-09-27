import { hourLabel } from '@/pages/appointments/presentation/calendar/calendar_functions';
import { busiestDaysAndHours, HEATMAP_WEEKDAYS, type BusiestBar, type Heatmap } from '../home_functions';
import { ChartCard } from './chartParts';

// Simple columns with the count on top; the busiest one is the only strong color, so the
// answer stands out before anyone reads a number
function BusiestRow({ title, bars, unit }: { title: string; bars: BusiestBar[]; unit: string }) {
  const max = Math.max(0, ...bars.map((bar) => bar.count));
  return (
    <div>
      <h3 className="!m-0 mb-2 !font-sans !text-xs !font-medium !tracking-normal !text-muted-foreground">{title}</h3>
      <ul className="m-0 flex h-28 list-none items-end gap-1 p-0">
        {bars.map((bar) => {
          const top = bar.count > 0 && bar.count === max;
          return (
            <li
              key={bar.label}
              className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1"
              aria-label={`${bar.label}: ${bar.count} ${unit}`}
            >
              <span className={top ? 'text-xs font-semibold text-foreground' : 'text-[11px] text-muted-foreground'}>
                {bar.count}
              </span>
              <span
                className="w-full max-w-8 rounded-t-[3px]"
                style={{
                  height: max > 0 ? `${Math.max(bar.count > 0 ? 4 : 0, (bar.count / max) * 100)}%` : 0,
                  background: top ? 'var(--meter-fill)' : 'var(--meter-track)',
                }}
              />
              <span
                className={`w-full truncate text-center text-[10px] ${top ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}
              >
                {bar.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function BusiestTimesChart({ id, heatmap, takeaway }: { id: string; heatmap: Heatmap; takeaway?: string }) {
  const { days, hours } = busiestDaysAndHours(heatmap);

  return (
    <ChartCard
      id={id}
      title="When do patients come?"
      subtitle="Cancelled appointments excluded"
      takeaway={takeaway}
      table={{
        columns: ['Hour', ...HEATMAP_WEEKDAYS],
        rows: heatmap.hours.map((hour, hourIndex) => [
          hourLabel(hour),
          ...HEATMAP_WEEKDAYS.map((_, day) => heatmap.counts[day][hourIndex]),
        ]),
      }}
    >
      {heatmap.max === 0 ? (
        <p className="py-8 text-center text-xs text-muted-foreground">No appointments in this period</p>
      ) : (
        <div className="flex flex-col gap-5">
          <BusiestRow title="Which day?" bars={days} unit="appointments" />
          <BusiestRow title="What time?" bars={hours} unit="appointments" />
        </div>
      )}
    </ChartCard>
  );
}
