import { addDays, eachDayOfInterval, format, isToday, startOfDay } from 'date-fns';
import { useMemo } from 'react';
import type { AppointmentOptions } from '@/lib/api/appointments';
import { cn } from '@/lib/utils';
import { dateKey, eventTitle, formatStatus, statusStyle } from './calendar_functions';
import type { CalendarEvent, EventMap } from './calendar_types';

const ScheduleView = ({
  options,
  currentDate,
  eventsByDay,
  onDateSelect,
  onEventSelect,
}: {
  options: AppointmentOptions;
  currentDate: Date;
  eventsByDay: EventMap;
  onDateSelect: (date: Date) => void;
  onEventSelect: (event: CalendarEvent, anchor?: HTMLElement) => void;
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
            <div key={dateKey(day)} className="grid gap-2 p-3 sm:grid-cols-[9rem_1fr] sm:gap-3 sm:p-4">
              {/* Busy days are long: the date stays in view while scrolling through them */}
              <button
                type="button"
                className="self-start text-left sm:sticky sm:top-0"
                onClick={() => onDateSelect(day)}
              >
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
                {dayEvents.length > 0 && (
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {dayEvents.length} {dayEvents.length === 1 ? 'appointment' : 'appointments'}
                  </span>
                )}
              </button>
              <div className="space-y-1">
                {dayEvents.length === 0 && (
                  <p className="py-2 text-sm text-muted-foreground">No appointments</p>
                )}
                {dayEvents.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    className="flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left transition hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                    onClick={(clickEvent) => onEventSelect(event, clickEvent.currentTarget)}
                  >
                    <span
                      className={cn(
                        'size-2.5 shrink-0 rounded-full',
                        statusStyle(event.status).dot,
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-foreground">
                        {eventTitle(options.appointmentType, event)}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')} ·{' '}
                        {event.patientName} · {event.doctorName}
                      </span>
                    </span>
                    <span
                      className={cn(
                        'hidden rounded-full border px-2 py-0.5 text-[11px] font-semibold sm:inline-flex',
                        statusStyle(event.status).badge,
                      )}
                    >
                      {formatStatus(options.appointmentStatus, event.status)}
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
