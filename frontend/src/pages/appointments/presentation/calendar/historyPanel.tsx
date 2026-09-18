import { addMonths, format, isSameMonth, subMonths } from 'date-fns';
import { CalendarClock } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { AppointmentOptions } from '@/lib/api/appointments';
import { cn } from '@/lib/utils';
import {
  eventTitle,
  formatStatus,
  groupEventsByDay,
  shortId,
  statusStyle,
} from './calendar_functions';
import type { CalendarEvent } from './calendar_types';
import HistoryDateNav from './historyDateNav';

const HistoryPanel = ({
  open,
  onOpenChange,
  options,
  events,
  onEventSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: AppointmentOptions;
  events: CalendarEvent[];
  onEventSelect: (event: CalendarEvent) => void;
}) => {
  const [historyMonth, setHistoryMonth] = useState(() => new Date());
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setHistoryMonth(new Date());
  }

  const goToPreviousMonth = () => setHistoryMonth((date) => subMonths(date, 1));
  const goToNextMonth = () => setHistoryMonth((date) => addMonths(date, 1));

  const days = useMemo(() => {
    const monthEvents = events.filter((event) => isSameMonth(event.start, historyMonth));
    return Array.from(groupEventsByDay(monthEvents).entries()).sort((a, b) =>
      a[0].localeCompare(b[0]),
    );
  }, [events, historyMonth]);

  const monthEventCount = useMemo(
    () => days.reduce((total, [, dayEvents]) => total + dayEvents.length, 0),
    [days],
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2">
            <CalendarClock className="size-4" />
            Appointment history
          </SheetTitle>
          <SheetDescription>Browse past and upcoming appointments by month.</SheetDescription>
        </SheetHeader>

        <div className="border-b px-4 py-3">
          <HistoryDateNav
            label={`${format(historyMonth, 'MMMM yyyy')} · ${monthEventCount} ${monthEventCount === 1 ? 'appointment' : 'appointments'}`}
            onPrevious={goToPreviousMonth}
            onNext={goToNextMonth}
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {days.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No appointments in {format(historyMonth, 'MMMM yyyy')}.
            </p>
          ) : (
            <div className="space-y-4">
              {days.map(([dayKey, dayEvents]) => (
                <div key={dayKey}>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {format(dayEvents[0].start, 'EEEE, MMM d')}
                  </p>
                  <div className="space-y-1.5">
                    {dayEvents.map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        className="flex w-full items-center gap-3 rounded-md border p-2.5 text-left transition hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                        onClick={() => onEventSelect(event)}
                      >
                        <span
                          className={cn(
                            'size-2.5 shrink-0 rounded-full',
                            statusStyle(event.status).dot,
                          )}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-foreground">
                            {eventTitle(options.appointmentType, event)}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')} ·{' '}
                            Patient {shortId(event.patient_id)}
                          </span>
                        </span>
                        <span
                          className={cn(
                            'hidden shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold sm:inline-flex',
                            statusStyle(event.status).badge,
                          )}
                        >
                          {formatStatus(options.appointmentStatus, event.status)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default HistoryPanel;
