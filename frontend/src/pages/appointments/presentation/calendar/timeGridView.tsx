import { format, isSameDay, isToday } from 'date-fns';
import { useEffect, useRef } from 'react';
import { dateKey, getEventPosition, hourLabel, layoutEventColumns } from './calendar_functions';
import type { CalendarEvent, EventMap } from './calendar_types';
import { cn } from '@/lib/utils';
import { HOUR_HEIGHT, HOURS, WORKDAY_START_HOUR } from './calendar_constants';
import AppointmentPill from './appointmentPill';

const TimeGridView = ({
  days,
  eventsByDay,
  onDateSelect,
  onEventSelect,
  selectedDate,
}: {
  days: Date[];
  eventsByDay: EventMap;
  onDateSelect: (date: Date, position?: { x: number; y: number }) => void;
  onEventSelect: (event: CalendarEvent) => void;
  selectedDate: Date;
}) => {
  const now = new Date();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const daysKey = days.map(dateKey).join();
  // Open at the start of the workday, or earlier when an appointment starts before it
  const firstHour = Math.min(
    WORKDAY_START_HOUR,
    ...days.flatMap((day) => (eventsByDay.get(dateKey(day)) ?? []).map((e) => e.start.getHours())),
  );

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = firstHour * HOUR_HEIGHT;
  }, [daysKey, firstHour]);
  const gridCols =
    days.length === 1
      ? 'grid-cols-[2.75rem_minmax(0,1fr)] sm:grid-cols-[3.75rem_minmax(0,1fr)]'
      : 'grid-cols-[2.75rem_repeat(7,minmax(5.75rem,1fr))] sm:grid-cols-[3.75rem_repeat(7,minmax(7rem,1fr))]';
  const gridMinWidth = days.length === 1 ? undefined : 720;

  return (
    <div ref={scrollRef} className="h-full min-w-0 overflow-auto">
      <div
        className={cn('sticky top-0 z-10 grid border-b bg-background', gridCols)}
        style={{ minWidth: gridMinWidth }}
      >
        <div className="border-r" />
        {days.map((day) => {
          const isSelected = isSameDay(day, selectedDate);

          return (
            <button
              key={dateKey(day)}
              type="button"
              className={cn(
                'flex min-h-14 select-none flex-col items-center justify-center gap-1 border-r px-1 py-2 text-center transition hover:bg-muted/50 sm:min-h-16 sm:px-2',
                isSelected && 'bg-sky-50',
              )}
              // Keyboard activation (detail 0) selects the day without opening the menu
              onClick={(event) =>
                onDateSelect(
                  day,
                  event.detail > 0 ? { x: event.clientX, y: event.clientY } : undefined,
                )
              }
            >
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {format(day, 'EEE')}
              </span>
              <span
                className={cn(
                  'inline-flex size-8 items-center justify-center rounded-full text-base font-medium',
                  isToday(day) && 'bg-[#1a73e8] text-white',
                  isSelected && !isToday(day) && 'bg-sky-600 text-white',
                )}
              >
                {format(day, 'd')}
              </span>
            </button>
          );
        })}
      </div>
      <div
        className={cn('grid', gridCols)}
        style={{ minHeight: HOURS.length * HOUR_HEIGHT, minWidth: gridMinWidth }}
      >
        <div className="relative border-r bg-background">
          {/* Midnight has no label: it would be cut off at the top edge */}
          {HOURS.filter((hour) => hour > 0).map((hour) => (
            <div
              key={hour}
              className="absolute right-1 -translate-y-2 text-[10px] text-muted-foreground sm:right-2 sm:text-[11px]"
              style={{ top: hour * HOUR_HEIGHT }}
            >
              {hourLabel(hour)}
            </div>
          ))}
        </div>
        {days.map((day) => {
          const dayEvents = eventsByDay.get(dateKey(day)) ?? [];
          const isSelected = isSameDay(day, selectedDate);
          const columns = layoutEventColumns(dayEvents);
          const showNow = isSameDay(day, now);
          const nowTop = ((now.getHours() * 60 + now.getMinutes()) / 60) * HOUR_HEIGHT;

          return (
            <div
              key={dateKey(day)}
              className={cn('relative select-none border-r', isSelected && 'bg-sky-50/50')}
              onDragStart={(event) => event.preventDefault()}
              onClick={(event) => onDateSelect(day, { x: event.clientX, y: event.clientY })}
            >
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="border-b border-border/70"
                  style={{ height: HOUR_HEIGHT }}
                />
              ))}
              {showNow && (
                <div
                  className="absolute left-0 right-0 z-20 h-px bg-[#ea4335]"
                  style={{ top: nowTop }}
                >
                  <span className="absolute -left-1 -top-1.5 size-3 rounded-full bg-[#ea4335]" />
                </div>
              )}
              {dayEvents.map((event) => {
                const position = getEventPosition(
                  event,
                  columns.get(event.id) ?? { column: 0, columns: 1 },
                );

                return (
                  <div
                    key={event.id}
                    className="absolute z-10"
                    onClick={(clickEvent) => clickEvent.stopPropagation()}
                    style={position}
                  >
                    <AppointmentPill event={event} onSelect={onEventSelect} />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimeGridView;
