import { format } from "date-fns"
import { eventTitle, statusStyle } from "./calendar_functions"
import type { CalendarEvent } from "./calendar_types"
import { cn } from "@/lib/utils"

const AppointmentPill = ({
  event,
  onSelect,
  compact = false,
}: {
  compact?: boolean
  event: CalendarEvent
  onSelect: (event: CalendarEvent) => void
}) => {
  const style = statusStyle(event.status)

  return (
    <button
      type="button"
      title={`${format(event.start, "h:mm a")} ${eventTitle(event)}`}
      className={cn(
        "flex w-full min-w-0 items-center gap-1 overflow-hidden rounded border px-1.5 text-left font-medium leading-5 transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
        compact ? "h-5 text-[11px] max-sm:px-1" : "h-full min-h-7 text-xs",
        event.status === "cancelled" && "opacity-70 line-through",
        style.event
      )}
      onClick={() => onSelect(event)}
    >
      <span className="shrink-0 tabular-nums max-sm:hidden">{format(event.start, "h:mm a")}</span>
      <span className="truncate max-sm:hidden">{eventTitle(event)}</span>
      <span className={cn("hidden size-2 rounded-full max-sm:block", statusStyle(event.status).dot)} />
    </button>
  )
}

export default AppointmentPill