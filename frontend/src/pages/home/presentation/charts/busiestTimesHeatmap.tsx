import { useState } from 'react';
import { hourLabel } from '@/pages/appointments/presentation/calendar/calendar_functions';
import { HEATMAP_WEEKDAYS, type Heatmap } from '../home_functions';
import { ChartCard, ChartTooltip } from './chartParts';

const STEPS = ['var(--seq-1)', 'var(--seq-2)', 'var(--seq-3)', 'var(--seq-4)', 'var(--seq-5)'];

// Five equal bins up to the busiest cell (bin i holds counts up to (i + 1) / 5 of it);
// empty cells stay surface
const binOf = (count: number, max: number) =>
  count === 0 || max === 0 ? -1 : Math.min(STEPS.length - 1, Math.ceil((count * STEPS.length) / max) - 1);

type Hover = { weekday: number; hour: number; count: number; left: number; top: number };

export function BusiestTimesHeatmap({ id, heatmap, takeaway }: { id: string; heatmap: Heatmap; takeaway?: string }) {
  const [hover, setHover] = useState<Hover | null>(null);
  const { hours, counts, max } = heatmap;
  const binRanges = STEPS.map((_, index) => {
    const low = Math.floor((index * max) / STEPS.length) + 1;
    const high = Math.floor(((index + 1) * max) / STEPS.length);
    if (low > high) return '—';
    return low === high ? `${low}` : `${low}–${high}`;
  });

  const show = (weekday: number, hourIndex: number, target: HTMLElement) =>
    setHover({
      weekday,
      hour: hours[hourIndex],
      count: counts[weekday][hourIndex],
      left: target.offsetLeft + target.offsetWidth / 2,
      top: target.offsetTop,
    });

  return (
    <ChartCard
      id={id}
      title="When do patients come?"
      subtitle="Each square is one hour of one weekday. The darker the square, the more appointments at that time. Cancelled appointments are not counted."
      takeaway={takeaway}
      table={{
        columns: ['Hour', ...HEATMAP_WEEKDAYS],
        rows: hours.map((hour, hourIndex) => [hourLabel(hour), ...HEATMAP_WEEKDAYS.map((_, day) => counts[day][hourIndex])]),
      }}
    >
      {max === 0 ? (
        <p className="py-8 text-center text-xs text-muted-foreground">No appointments in this period</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <div
              className="relative grid min-w-[26rem] gap-0.5"
              style={{ gridTemplateColumns: `2.5rem repeat(${hours.length}, minmax(1.25rem, 1fr))` }}
              onMouseLeave={() => setHover(null)}
            >
              <span />
              {hours.map((hour, index) => (
                <span key={hour} className="text-center text-[10px] text-[color:var(--viz-muted)]">
                  {/* Every other hour: the full set would collide on narrow cards */}
                  {index % 2 === 0 ? hourLabel(hour).replace(' ', '').toLowerCase() : ''}
                </span>
              ))}
              {HEATMAP_WEEKDAYS.map((weekday, day) => (
                <div key={weekday} className="contents">
                  <span className="flex items-center text-[11px] text-muted-foreground">{weekday}</span>
                  {hours.map((hour, hourIndex) => {
                    const count = counts[day][hourIndex];
                    const bin = binOf(count, max);
                    const isHovered = hover?.weekday === day && hover.hour === hour;
                    return (
                      <div
                        key={hour}
                        role="img"
                        tabIndex={0}
                        aria-label={`${weekday} ${hourLabel(hour)}: ${count} appointments`}
                        className="h-6 rounded-[3px] outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50"
                        style={{
                          background: bin < 0 ? 'var(--viz-hover)' : STEPS[bin],
                          boxShadow: isHovered ? 'inset 0 0 0 2px var(--foreground)' : undefined,
                        }}
                        onMouseEnter={(event) => show(day, hourIndex, event.currentTarget)}
                        onFocus={(event) => show(day, hourIndex, event.currentTarget)}
                        onBlur={() => setHover(null)}
                      />
                    );
                  })}
                </div>
              ))}
              {hover && (
                <div
                  className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full pb-1.5"
                  style={{ left: hover.left, top: hover.top }}
                >
                  <ChartTooltip
                    title={`${HEATMAP_WEEKDAYS[hover.weekday]} · ${hourLabel(hover.hour)}`}
                    rows={[{ label: hover.count === 1 ? 'appointment' : 'appointments', value: String(hover.count) }]}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>Fewer appointments</span>
            <ul className="m-0 flex list-none gap-0.5 p-0">
              {STEPS.map((color, index) => binRanges[index] !== '—' && (
                <li key={color} className="flex flex-col items-center gap-0.5">
                  <span className="h-2.5 w-7 rounded-[2px]" style={{ background: color }} />
                  <span className="tabular-nums">{binRanges[index]}</span>
                </li>
              ))}
            </ul>
            <span>More appointments</span>
          </div>
        </>
      )}
    </ChartCard>
  );
}
