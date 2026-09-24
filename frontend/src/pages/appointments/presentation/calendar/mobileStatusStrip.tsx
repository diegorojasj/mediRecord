import { cn, type SelectOption } from '@/lib/utils';
import type { AppointmentStatus } from '@/types/appointments_type';
import { statusStyle } from './calendar_functions';

const MobileStatusStrip = ({
  appointmentStatus,
  statusCounts,
  toggleStatus,
  visibleStatuses,
}: {
  appointmentStatus: SelectOption<AppointmentStatus>[];
  statusCounts: Record<AppointmentStatus, number>;
  toggleStatus: (status: AppointmentStatus) => void;
  visibleStatuses: Set<AppointmentStatus>;
}) => {
  return (
    <div className="flex min-w-0 gap-2 overflow-x-auto border-b px-2 py-2 sm:px-3 2xl:hidden">
      {appointmentStatus.map((statusOption) => {
        const active = visibleStatuses.has(statusOption.value);
        // The only selected status can't be unchecked
        const isLast = active && visibleStatuses.size === 1;

        return (
          <button
            key={statusOption.value}
            type="button"
            aria-pressed={active}
            aria-disabled={isLast}
            title={isLast ? 'At least one status must stay selected' : undefined}
            className={cn(
              'inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border px-2 text-[11px] font-medium',
              active
                ? 'border-border bg-background text-foreground'
                : 'border-transparent bg-muted/60 text-muted-foreground',
              isLast && 'cursor-not-allowed',
            )}
            onClick={() => toggleStatus(statusOption.value)}
          >
            <span className={cn('size-2 rounded-full', statusStyle(statusOption.value).dot)} />
            {statusOption.label}
            <span className="text-muted-foreground">{statusCounts[statusOption.value]}</span>
          </button>
        );
      })}
    </div>
  );
};

export default MobileStatusStrip;
