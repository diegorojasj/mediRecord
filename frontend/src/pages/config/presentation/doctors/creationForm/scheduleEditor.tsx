import type { SelectOption } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { WeekDay } from '@/types/doctors_type';
import { formatHourRanges } from '../doctors_functions';
import type { Schedule } from './creationForm_types';

const HOURS = Array.from({ length: 24 }, (_, h) => h);
const WORKDAY_PRESET = [8, 9, 10, 11, 14, 15, 16, 17];

const ScheduleEditor = ({
  schedule,
  weekDays,
  onChange,
}: {
  schedule: Schedule;
  weekDays: SelectOption<WeekDay>[];
  onChange: (day: WeekDay, hours: number[]) => void;
}) => {
  const toggleHour = (day: WeekDay, hour: number) => {
    const current = schedule[day] ?? [];
    const next = current.includes(hour)
      ? current.filter((h) => h !== hour)
      : [...current, hour].sort((a, b) => a - b);
    onChange(day, next);
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
            <div className="grid grid-cols-8 gap-1 sm:grid-cols-12">
              {HOURS.map((hour) => {
                const selected = hours.includes(hour);
                return (
                  <button
                    key={hour}
                    type="button"
                    aria-pressed={selected}
                    aria-label={`${label} ${hour}:00`}
                    onClick={() => toggleHour(day, hour)}
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
