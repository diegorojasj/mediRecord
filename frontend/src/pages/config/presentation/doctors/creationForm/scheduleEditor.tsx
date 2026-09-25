import { useRef, type PointerEvent } from 'react';
import type { SelectOption } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { WeekDay } from '@/types/doctors_type';
import { formatHourRanges } from '../doctors_functions';
import type { Schedule } from './creationForm_types';

const HOURS = Array.from({ length: 24 }, (_, h) => h);
const WORKDAY_PRESET = [8, 9, 10, 11, 14, 15, 16, 17];

// A drag paints every hour between the anchor and the hovered one, on a single day
type DragState = {
  day: WeekDay;
  anchor: number;
  // Hours of the day before the drag started, so shrinking the drag restores them
  base: number[];
  // Whether the drag selects or clears hours (decided by the first hour pressed)
  add: boolean;
};

const hoursBetween = (a: number, b: number) =>
  HOURS.filter((h) => h >= Math.min(a, b) && h <= Math.max(a, b));

const ScheduleEditor = ({
  schedule,
  weekDays,
  onChange,
}: {
  schedule: Schedule;
  weekDays: SelectOption<WeekDay>[];
  onChange: (day: WeekDay, hours: number[]) => void;
}) => {
  const dragRef = useRef<DragState | null>(null);
  // Last hour pressed, used as the anchor of a Shift+click range
  const lastHourRef = useRef<{ day: WeekDay; hour: number } | null>(null);

  const toggleHour = (day: WeekDay, hour: number) => {
    const current = schedule[day] ?? [];
    const next = current.includes(hour)
      ? current.filter((h) => h !== hour)
      : [...current, hour].sort((a, b) => a - b);
    onChange(day, next);
  };

  const applyDrag = (hour: number) => {
    const drag = dragRef.current;
    if (!drag) return;
    const range = hoursBetween(drag.anchor, hour);
    const next = drag.add
      ? [...new Set([...drag.base, ...range])].sort((a, b) => a - b)
      : drag.base.filter((h) => !range.includes(h));
    onChange(drag.day, next);
  };

  const endDrag = () => {
    dragRef.current = null;
    window.removeEventListener('pointerup', endDrag);
    window.removeEventListener('pointercancel', endDrag);
  };

  const startDrag = (event: PointerEvent<HTMLButtonElement>, day: WeekDay, hour: number) => {
    if (event.button !== 0) return;
    event.preventDefault();
    // Touch pointers are captured by the pressed button; release it so the
    // hours under the finger receive pointerenter while dragging
    event.currentTarget.releasePointerCapture(event.pointerId);

    const hours = schedule[day] ?? [];
    const last = lastHourRef.current;
    dragRef.current = {
      day,
      anchor: event.shiftKey && last?.day === day ? last.hour : hour,
      base: hours,
      add: !hours.includes(hour),
    };
    lastHourRef.current = { day, hour };
    applyDrag(hour);

    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
  };

  return (
    <div className="flex flex-col gap-3">
      {weekDays.map(({ value: day, label }) => {
        const hours = schedule[day] ?? [];
        return (
          <div key={day} className="rounded-md border border-border p-2">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-foreground">{label}</span>
              <span className="min-w-0 flex-1 truncate text-right text-[11px] text-muted-foreground">
                {hours.length > 0 ? formatHourRanges(hours) : 'Not working'}
              </span>
              <button
                type="button"
                className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => onChange(day, hours.length > 0 ? [] : WORKDAY_PRESET)}
              >
                {hours.length > 0 ? 'Clear' : '8–12 / 14–18'}
              </button>
            </div>
            <div className="grid touch-none select-none grid-cols-8 gap-1 sm:grid-cols-12">
              {HOURS.map((hour) => {
                const selected = hours.includes(hour);
                return (
                  <button
                    key={hour}
                    type="button"
                    aria-pressed={selected}
                    aria-label={`${label} ${hour}:00`}
                    onPointerDown={(event) => startDrag(event, day, hour)}
                    onPointerEnter={() => {
                      if (dragRef.current?.day === day) applyDrag(hour);
                    }}
                    // Pointer clicks are handled on pointerdown; this covers the keyboard
                    onClick={(event) => {
                      if (event.detail === 0) toggleHour(day, hour);
                    }}
                    className={cn(
                      'rounded py-1 text-[10px] font-medium tabular-nums transition-colors',
                      selected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    {String(hour).padStart(2, '0')}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ScheduleEditor;
