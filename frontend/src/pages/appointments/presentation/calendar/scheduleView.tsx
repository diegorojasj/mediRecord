import { useMemo } from 'react';
import type { CalendarEvent, EventMap } from './calendar_types';
import { addDays, eachDayOfInterval, format, isToday, startOfDay } from 'date-fns';
import { dateKey, eventTitle, formatStatus, shortId, statusStyle } from './calendar_functions';
import { cn } from '@/lib/utils';

const ScheduleView = ({
  currentDate,
  eventsByDay,
  onDateSelect,
  onEventSelect,
}: {
  currentDate: Date;
  eventsByDay: EventMap;
  onDateSelect: (date: Date) => void;
  onEventSelect: (event: CalendarEvent) => void;
}) => {
  const days = useMemo(
    () =>
      eachDayOfInterval({
        end: addDays(startOfDay(currentDate), 20),
        start: startOfDay(currentDate),
      }),
    [currentDate],
  );

  return (
    <div className="h-full overflow-auto p-2 sm:p-4">
      <div className="mx-auto max-w-5xl divide-y rounded-md border bg-background">
        {days.map((day) => {
          const dayEvents = eventsByDay.get(dateKey(day)) ?? [];

          return (
            <div key={dateKey(day)} className="grid gap-3 p-3 sm:grid-cols-[9rem_1fr] sm:p-4">
              <button type="button" className="text-left" onClick={() => onDateSelect(day)}>
                <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {format(day, 'EEE')}
                </span>
                <span
                  className={cn(
                    'mt-1 inline-flex items-baseline gap-2 rounded-full px-2 py-1 text-sm font-semibold',
                    isToday(day) ? 'bg-[#1a73e8] text-white' : 'text-foreground',
                  )}
                >
                  {format(day, 'MMM d')}
                </span>
              </button>
              <div className="space-y-2">
                {dayEvents.length === 0 && (
                  <p className="py-2 text-sm text-muted-foreground">No appointments</p>
                )}
                {dayEvents.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    className="flex w-full items-center gap-3 rounded-md border p-3 text-left transition hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                    onClick={() => onEventSelect(event)}
                  >
                    <span
                      className={cn(
                        'size-2.5 shrink-0 rounded-full',
                        statusStyle(event.status).dot,
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-foreground">
                        {eventTitle(event)}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')} · Patient{' '}
                        {shortId(event.patient_id)}
                      </span>
                    </span>
                    <span
                      className={cn(
                        'hidden rounded-full border px-2 py-0.5 text-[11px] font-semibold sm:inline-flex',
                        statusStyle(event.status).badge,
                      )}
                    >
                      {formatStatus(event.status)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScheduleView;
