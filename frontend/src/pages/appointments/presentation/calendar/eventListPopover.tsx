import { format, startOfToday } from 'date-fns';
import { CalendarDays, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import type { AppointmentOptions } from '@/lib/api/appointments';
import { cn } from '@/lib/utils';
import { eventTitle, statusStyle } from './calendar_functions';
import type { CalendarEvent } from './calendar_types';
import { anchoredPanelLayout, useAnchoredPanel } from './useAnchoredPanel';

// What a view asks the list to show: the appointments that didn't fit, and what was clicked
export type EventList = {
  title: string;
  events: CalendarEvent[];
  anchor: HTMLElement;
  day: Date;
};

// Every appointment of a day (or of a crowded time range) as a scrollable list, so busy days
// stay readable in the calendar grids
const EventListPopover = ({
  options,
  list,
  onEventSelect,
  onOpenDay,
  onClose,
}: {
  options: AppointmentOptions;
  list: EventList;
  onEventSelect: (event: CalendarEvent, anchor?: HTMLElement) => void;
  // Omitted when the list is already shown in the day view
  onOpenDay?: (day: Date) => void;
  onClose: () => void;
}) => {
  const { panelRef, ...placement } = useAnchoredPanel(list.anchor, onClose);
  const layout = anchoredPanelLayout(placement, { width: 'w-[20rem]', fallback: 'fixed right-4 top-20' });
  // The calendar doesn't navigate to past days (their appointments are in the history)
  const canOpenDay = !!onOpenDay && list.day.getTime() >= startOfToday().getTime();

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-label={list.title}
      className={cn(
        'z-40 flex flex-col overflow-hidden border bg-popover text-popover-foreground shadow-xl',
        layout.className,
      )}
      style={layout.style}
    >
      <div className="flex shrink-0 items-start justify-between gap-2 border-b px-3 py-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{list.title}</p>
          <p className="text-xs text-muted-foreground">
            {list.events.length} {list.events.length === 1 ? 'appointment' : 'appointments'}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {canOpenDay && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              title="Open in day view"
              onClick={() => {
                onClose();
                onOpenDay?.(list.day);
              }}
            >
              <CalendarDays className="size-3.5" />
              <span className="sr-only">Open in day view</span>
            </Button>
          )}
          <Button type="button" variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="size-3.5" />
            <span className="sr-only">Close list</span>
          </Button>
        </div>
      </div>
      <ul className="min-h-0 flex-1 divide-y overflow-y-auto">
        {list.events.map((event) => (
          <li key={event.id}>
            <button
              type="button"
              className={cn(
                'flex w-full items-center gap-2.5 px-3 py-2 text-left transition hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none',
                event.status === 'cancelled' && 'opacity-70',
              )}
              onClick={() => {
                // The list closes, so the details open next to what opened the list
                onClose();
                onEventSelect(event, list.anchor);
              }}
            >
              <span className={cn('size-2 shrink-0 rounded-full', statusStyle(event.status).dot)} />
              <span className="w-[4.5rem] shrink-0 text-xs tabular-nums text-muted-foreground">
                {format(event.start, 'h:mm a')}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    'block truncate text-xs font-medium text-foreground',
                    event.status === 'cancelled' && 'line-through',
                  )}
                >
                  {event.patientName}
                </span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {eventTitle(options.appointmentType, event)} · {event.doctorName}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>,
    document.body,
  );
};

export default EventListPopover;
