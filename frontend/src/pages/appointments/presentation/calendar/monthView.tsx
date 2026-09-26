import { useMemo, useRef, useState, type WheelEvent } from 'react';
import type { AppointmentOptions } from '@/lib/api/appointments';
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
import EventListPopover, { type EventList } from './eventListPopover';
import { useMeasuredElement } from './useMeasuredElement';

const WHEEL_NAVIGATION_COOLDOWN = 220;
const WHEEL_NAVIGATION_THRESHOLD = 50;
// How many rows fit in a day's list. Compact pills and the "more" button are h-5 (1.25rem,
// scaled with the root font size) and are stacked with the list's row gap
const rowsThatFit = (list: HTMLElement) => {
  const rowHeight = 1.25 * parseFloat(getComputedStyle(document.documentElement).fontSize);
  const gap = parseFloat(getComputedStyle(list).rowGap) || 0;
  return Math.max(1, Math.floor((list.clientHeight + gap) / (rowHeight + gap)));
};

const getVisibleMonthDays = (date: Date) => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);

  return eachDayOfInterval({
    end: endOfWeek(monthEnd, { weekStartsOn: WEEK_STARTS_ON }),
    start: startOfWeek(monthStart, { weekStartsOn: WEEK_STARTS_ON }),
  });
};

const MonthView = ({
  options,
  currentDate,
  eventsByDay,
  onDateSelect,
  onDateViewOpen,
  onEventSelect,
  onMonthScroll,
  selectedDate,
  setView,
}: {
  options: AppointmentOptions;
  currentDate: Date;
  eventsByDay: EventMap;
  onDateSelect: (date: Date, position?: { x: number; y: number }) => void;
  onDateViewOpen: (date: Date) => void;
  onEventSelect: (event: CalendarEvent, anchor?: HTMLElement) => void;
  onMonthScroll: (direction: -1 | 1) => void;
  selectedDate: Date;
  setView: (view: CalendarView) => void;
}) => {
  // Every day's list has the same height, so measuring the first one is enough
  const [listRef, rows] = useMeasuredElement(rowsThatFit, 3);
  const [eventList, setEventList] = useState<EventList | null>(null);
  const lastWheelNavigationRef = useRef(0);
  const wheelDeltaRef = useRef(0);

  const days = useMemo(() => getVisibleMonthDays(currentDate), [currentDate]);
  const today = useMemo(() => startOfDay(new Date()), []);

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (event.ctrlKey || eventList) return;

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
        {days.map((day, index) => {
          const dayEvents = eventsByDay.get(dateKey(day)) ?? [];
          // Fill the day; when some don't fit, the last row becomes the "more" button
          const visibleEvents =
            dayEvents.length <= rows ? dayEvents : dayEvents.slice(0, rows - 1);
          const hiddenEvents = dayEvents.length - visibleEvents.length;
          const outside = !isSameMonth(day, currentDate);
          const isPast = day.getTime() < today.getTime();
          const isSelected = isSameDay(day, selectedDate);

          return (
            <div
              key={dateKey(day)}
              className={cn(
                'flex min-h-0 select-none flex-col overflow-hidden border-b border-r p-1 sm:p-1.5',
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
                  'mb-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-medium transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 sm:mb-1 sm:size-7 sm:text-xs',
                  isPast && 'cursor-not-allowed text-muted-foreground hover:bg-transparent',
                  isToday(day) && 'bg-[#1a73e8] text-white hover:bg-[#1967d2]',
                  isSelected && !isToday(day) && 'bg-sky-600 text-white hover:bg-sky-700',
                )}
              >
                {format(day, 'd')}
              </button>
              <div
                ref={index === 0 ? listRef : undefined}
                className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden"
                // Clicks on an appointment stay here; clicks on the empty space select the day
                onClick={(event) => {
                  if (event.target !== event.currentTarget) event.stopPropagation();
                }}
              >
                {visibleEvents.map((event) => (
                  <AppointmentPill key={event.id} compact event={event} onSelect={onEventSelect} />
                ))}
                {hiddenEvents > 0 && (
                  <button
                    type="button"
                    className="h-5 shrink-0 rounded px-1 text-left text-[10px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground sm:px-1.5 sm:text-[11px]"
                    onClick={(clickEvent) =>
                      setEventList({
                        title: format(day, 'EEEE, MMMM d'),
                        events: dayEvents,
                        anchor: clickEvent.currentTarget,
                        day,
                      })
                    }
                  >
                    {visibleEvents.length === 0 ? `${hiddenEvents} appts` : `${hiddenEvents} more`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {eventList && (
        <EventListPopover
          options={options}
          list={eventList}
          onEventSelect={onEventSelect}
          onOpenDay={(day) => {
            onDateViewOpen(day);
            setView('day');
          }}
          onClose={() => setEventList(null)}
        />
      )}
    </div>
  );
};

export default MonthView;
