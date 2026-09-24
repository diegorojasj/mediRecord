import { differenceInMinutes, format } from 'date-fns';
import { Clock3, Pencil, Stethoscope, UserRound, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AppointmentOptions } from '@/lib/api/appointments';
import { cn } from '@/lib/utils';
import { eventTitle, formatStatus, formatType, statusStyle } from './calendar_functions';
import type { CalendarEvent } from './calendar_types';

const AppointmentDetails = ({ options, event, onEdit, onClose }: { options: AppointmentOptions, event: CalendarEvent; onEdit: (event: CalendarEvent) => void; onClose: () => void }) => {
  return (
    <div className="absolute inset-x-3 top-24 z-30 max-h-[calc(100%-7rem)] overflow-auto rounded-md border bg-popover p-4 text-popover-foreground shadow-xl sm:left-auto sm:right-4 sm:top-20 sm:w-[22rem]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn('size-3 rounded-full', statusStyle(event.status).dot)} />
            <h3 className="m-0 truncate text-base font-semibold text-foreground">
              {eventTitle(options.appointmentType, event)}
            </h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatType(options.appointmentType, event.type)} · {formatStatus(options.appointmentStatus, event.status)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            title="Edit appointment"
            onClick={() => onEdit(event)}
          >
            <Pencil className="size-3.5" />
            <span className="sr-only">Edit appointment</span>
          </Button>
          <Button type="button" variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="size-3.5" />
            <span className="sr-only">Close appointment details</span>
          </Button>
        </div>
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
            <p className="font-medium text-foreground">{event.patientName}</p>
            {event.patientDetail && (
              <p className="truncate text-xs text-muted-foreground">{event.patientDetail}</p>
            )}
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Stethoscope className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="font-medium text-foreground">{event.doctorName}</p>
            {event.doctorDetail && (
              <p className="truncate text-xs text-muted-foreground">{event.doctorDetail}</p>
            )}
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
