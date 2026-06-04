import { cn } from '@/lib/utils';
import type { CalendarEvent } from './calendar_types';
import { eventTitle, formatStatus, formatType, shortId, statusStyle } from './calendar_functions';
import { Button } from '@/components/ui/button';
import { Clock3, Stethoscope, UserRound, X } from 'lucide-react';
import { differenceInMinutes, format } from 'date-fns';

const AppointmentDetails = ({ event, onClose }: { event: CalendarEvent; onClose: () => void }) => {
  return (
    <div className="absolute inset-x-3 top-24 z-30 max-h-[calc(100%-7rem)] overflow-auto rounded-md border bg-popover p-4 text-popover-foreground shadow-xl sm:left-auto sm:right-4 sm:top-20 sm:w-[22rem]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn('size-3 rounded-full', statusStyle(event.status).dot)} />
            <h2 className="m-0 truncate text-base font-semibold text-foreground">
              {eventTitle(event)}
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatType(event.type)} · {formatStatus(event.status)}
          </p>
        </div>
        <Button type="button" variant="ghost" size="icon-sm" onClick={onClose}>
          <X className="size-3.5" />
          <span className="sr-only">Close appointment details</span>
        </Button>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-start gap-3">
          <Clock3 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="font-medium text-foreground">{format(event.start, 'EEEE, MMMM d')}</p>
            <p className="text-xs text-muted-foreground">
              {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')} ·{' '}
              {differenceInMinutes(event.end, event.start)} min
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <UserRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="font-medium text-foreground">Patient {shortId(event.patient_id)}</p>
            <p className="truncate text-xs text-muted-foreground">{event.patient_id}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Stethoscope className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="font-medium text-foreground">Doctor {shortId(event.doctor_id)}</p>
            <p className="truncate text-xs text-muted-foreground">{event.doctor_id}</p>
          </div>
        </div>
        {event.notes && (
          <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
            {event.notes}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentDetails;
