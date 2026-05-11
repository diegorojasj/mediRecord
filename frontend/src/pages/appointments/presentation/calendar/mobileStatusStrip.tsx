import type { AppointmentStatus } from "@/types/appointments_type"
import { STATUS_ORDER } from "./calendar_constants"
import { formatStatus, statusStyle } from "./calendar_functions"
import { cn } from "@/lib/utils"

const MobileStatusStrip = ({
  statusCounts,
  toggleStatus,
  visibleStatuses,
}: {
  statusCounts: Record<AppointmentStatus, number>
  toggleStatus: (status: AppointmentStatus) => void
  visibleStatuses: Set<AppointmentStatus>
}) => {
  return (
    <div className="flex min-w-0 gap-2 overflow-x-auto border-b px-2 py-2 sm:px-3 2xl:hidden">
      {STATUS_ORDER.map((status) => {
        const active = visibleStatuses.has(status)

        return (
          <button
            key={status}
            type="button"
            className={cn(
              "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border px-2 text-[11px] font-medium",
              active
                ? "border-border bg-background text-foreground"
                : "border-transparent bg-muted/60 text-muted-foreground"
            )}
            onClick={() => toggleStatus(status)}
          >
            <span className={cn("size-2 rounded-full", statusStyle(status).dot)} />
            {formatStatus(status)}
            <span className="text-muted-foreground">{statusCounts[status]}</span>
          </button>
        )
      })}
    </div>
  )
}

export default MobileStatusStrip
