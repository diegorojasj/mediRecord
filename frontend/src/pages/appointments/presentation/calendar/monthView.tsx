import { useMemo, useRef, type WheelEvent } from 'react';
import type {
  CalendarEvent,
  CalendarView,
  EventMap,
} from './calendar_types';
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { WEEK_STARTS_ON, WEEKDAYS } from './calendar_constants';
import { dateKey } from './calendar_functions';
import { cn } from '@/lib/utils';
import AppointmentPill from './appointmentPill';

const WHEEL_NAVIGATION_COOLDOWN = 220;
const WHEEL_NAVIGATION_THRESHOLD = 50;

const getVisibleMonthDays = (date: Date) => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);

  return eachDayOfInterval({
    end: endOfWeek(monthEnd, { weekStartsOn: WEEK_STARTS_ON }),
    start: startOfWeek(monthStart, { weekStartsOn: WEEK_STARTS_ON }),
  });
};

const MonthView = ({
  currentDate,
  eventsByDay,
  onDateSelect,
  onDateViewOpen,
  onEventSelect,
  onMonthScroll,
  selectedDate,
  setView,
}: {
  currentDate: Date;
  eventsByDay: EventMap;
  onDateSelect: (date: Date, position?: { x: number; y: number }) => void;
  onDateViewOpen: (date: Date) => void;
  onEventSelect: (event: CalendarEvent) => void;
  onMonthScroll: (direction: -1 | 1) => void;
  selectedDate: Date;
  setView: (view: CalendarView) => void;
}) => {
  const lastWheelNavigationRef = useRef(0);
  const wheelDeltaRef = useRef(0);

  const days = useMemo(() => getVisibleMonthDays(currentDate), [currentDate]);
  const today = useMemo(() => startOfDay(new Date()), []);

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (event.ctrlKey) return;

    const primaryDelta =
      Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
    if (Math.abs(primaryDelta) < 1) return;

    event.preventDefault();
    event.stopPropagation();

    wheelDeltaRef.current += primaryDelta;
    if (Math.abs(wheelDeltaRef.current) < WHEEL_NAVIGATION_THRESHOLD) return;

    const now = Date.now();
    if (now - lastWheelNavigationRef.current < WHEEL_NAVIGATION_COOLDOWN) return;

    const direction = wheelDeltaRef.current > 0 ? 1 : -1;

    wheelDeltaRef.current = 0;
    lastWheelNavigationRef.current = now;
    onMonthScroll(direction);
  };

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden" onWheel={handleWheel}>
      <div className="grid shrink-0 grid-cols-7 border-b bg-muted/30">
        {WEEKDAYS.map((weekday) => (
          <div
            key={weekday}
            className="px-1 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:px-2 sm:text-[11px]"
          >
            <span className="sm:hidden">{weekday.slice(0, 1)}</span>
            <span className="hidden sm:inline">{weekday}</span>
          </div>
        ))}
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-7 auto-rows-fr">
        {days.map((day) => {
          const dayEvents = eventsByDay.get(dateKey(day)) ?? [];
          const visibleEvents = dayEvents.slice(0, 3);
          const hiddenEvents = dayEvents.length - visibleEvents.length;
          const outside = !isSameMonth(day, currentDate);
          const isPast = day.getTime() < today.getTime();
          const isSelected = isSameDay(day, selectedDate);

          return (
            <div
              key={dateKey(day)}
              className={cn(
                'min-h-0 select-none overflow-hidden border-b border-r p-1 sm:p-1.5',
                isPast ? 'cursor-not-allowed' : 'cursor-pointer',
                outside && 'bg-muted/20 text-muted-foreground',
                isPast && !outside && 'bg-muted/10 text-muted-foreground',
                isSelected && 'bg-sky-50 ring-2 ring-sky-500/70 ring-inset',
                isSelected && outside && 'bg-sky-50/70',
              )}
              onDragStart={(event) => event.preventDefault()}
              // Keyboard activation (detail 0) selects the day without opening the menu
              onClick={(event) =>
                onDateSelect(
                  day,
                  event.detail > 0 ? { x: event.clientX, y: event.clientY } : undefined,
                )
              }
            >
              <button
                type="button"
                className={cn(
                  'mb-0.5 inline-flex size-6 items-center justify-center rounded-full text-[11px] font-medium transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 sm:mb-1 sm:size-7 sm:text-xs',
                  isPast && 'cursor-not-allowed text-muted-foreground hover:bg-transparent',
                  isToday(day) && 'bg-[#1a73e8] text-white hover:bg-[#1967d2]',
                  isSelected && !isToday(day) && 'bg-sky-600 text-white hover:bg-sky-700',
                )}
              >
                {format(day, 'd')}
              </button>
              <div
                className="space-y-0.5 sm:space-y-1"
                onClick={(event) => event.stopPropagation()}
              >
                {visibleEvents.map((event) => (
                  <AppointmentPill key={event.id} compact event={event} onSelect={onEventSelect} />
                ))}
                {hiddenEvents > 0 && (
                  <button
                    type="button"
                    className="h-5 rounded px-1 text-[10px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground sm:px-1.5 sm:text-[11px]"
                    onClick={() => {
                      onDateViewOpen(day);
                      setView('day');
                    }}
                  >
                    {hiddenEvents} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;
