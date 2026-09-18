import { cn, type SelectOption } from "@/lib/utils";
import { statusStyle } from "@/pages/appointments/presentation/calendar/calendar_functions";
import type { AppointmentStatus } from "@/types/appointments_type";

const StatusFilters = ({
  appointmentStatus,
  statusCounts,
  toggleStatus,
  visibleStatuses,
}: {
  appointmentStatus: SelectOption<AppointmentStatus>[],
  statusCounts: Record<AppointmentStatus, number>;
  toggleStatus: (status: AppointmentStatus) => void;
  visibleStatuses: Set<AppointmentStatus>;
}) => {
  return (
    <div className="space-y-1">
      {appointmentStatus.map((statusOption) => (
        <label
          key={statusOption.value}
          className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-xs hover:bg-muted/70"
        >
          <input
            type="checkbox"
            checked={visibleStatuses.has(statusOption.value)}
            className="size-3.5 rounded border-border accent-[#1a73e8]"
            onChange={() => toggleStatus(statusOption.value)}
          />
          <span className={cn('size-2.5 rounded-full', statusStyle(statusOption.value).dot)} />
          <span className="min-w-0 flex-1 truncate">{statusOption.label}</span>
          <span className="text-muted-foreground">{statusCounts[statusOption.value]}</span>
        </label>
      ))}
    </div>
  );
}

export default StatusFilters
