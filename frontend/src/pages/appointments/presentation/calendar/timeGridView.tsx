import { format, isSameDay, isToday } from "date-fns"
import { dateKey, getEventPosition, hourLabel } from "./calendar_functions"
import type { CalendarDateSelection, CalendarEvent, EventMap } from "./calendar_types"
import { cn } from "@/lib/utils"
import { HOUR_HEIGHT, HOURS, WORKDAY_END_HOUR, WORKDAY_START_HOUR } from "./calendar_constants"
import AppointmentPill from "./appointmentPill"

const dateIsInSelection = (date: Date, selection: CalendarDateSelection) => {
  const time = date.getTime()

  return time >= selection.start.getTime() && time <= selection.end.getTime()
}

const TimeGridView = ({
  dateSelection,
  days,
  eventsByDay,
  onDateSelect,
  onDateSelectionEnd,
  onDateSelectionMove,
  onDateSelectionStart,
  onEventSelect,
  selectedDate,
}: {
  dateSelection: CalendarDateSelection
  days: Date[]
  eventsByDay: EventMap
  onDateSelect: (date: Date) => void
  onDateSelectionEnd: () => void
  onDateSelectionMove: (date: Date) => void
  onDateSelectionStart: (date: Date) => void
  onEventSelect: (event: CalendarEvent) => void
  selectedDate: Date
}) => {
  const now = new Date()
  const gridCols =
    days.length === 1
      ? "grid-cols-[2.75rem_minmax(0,1fr)] sm:grid-cols-[3.75rem_minmax(0,1fr)]"
      : "grid-cols-[2.75rem_repeat(7,minmax(5.75rem,1fr))] sm:grid-cols-[3.75rem_repeat(7,minmax(7rem,1fr))]"
  const gridMinWidth = days.length === 1 ? undefined : 720

  return (
    <div className="h-full min-w-0 overflow-auto">
      <div
        className={cn("sticky top-0 z-10 grid border-b bg-background", gridCols)}
        style={{ minWidth: gridMinWidth }}
      >
        <div className="border-r" />
        {days.map((day) => {
          const inSelection = dateIsInSelection(day, dateSelection)
          const selectionStart = isSameDay(day, dateSelection.start)
          const selectionEnd = isSameDay(day, dateSelection.end)

          return (
            <button
              key={dateKey(day)}
              type="button"
              className={cn(
                "flex min-h-14 select-none flex-col items-center justify-center gap-1 border-r px-1 py-2 text-center transition hover:bg-muted/50 sm:min-h-16 sm:px-2",
                (inSelection || isSameDay(day, selectedDate)) && "bg-sky-50"
              )}
              onClick={() => onDateSelect(day)}
              onPointerDown={(event) => {
                if (event.button !== 0) return
                event.preventDefault()
                onDateSelectionStart(day)
              }}
              onPointerUp={(event) => {
                if (event.button !== 0) return
                onDateSelectionEnd()
              }}
              onPointerEnter={() => onDateSelectionMove(day)}
            >
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {format(day, "EEE")}
              </span>
              <span
                className={cn(
                  "inline-flex size-8 items-center justify-center rounded-full text-base font-medium",
                  isToday(day) && "bg-[#1a73e8] text-white",
                  inSelection && !isToday(day) && "bg-sky-100 text-sky-800",
                  (selectionStart || selectionEnd) &&
                    !isToday(day) &&
                    "bg-sky-600 text-white"
                )}
              >
                {format(day, "d")}
              </span>
            </button>
          )
        })}
      </div>
      <div
        className={cn("grid", gridCols)}
        style={{ minHeight: HOURS.length * HOUR_HEIGHT, minWidth: gridMinWidth }}
      >
        <div className="relative border-r bg-background">
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="absolute right-1 -translate-y-2 text-[10px] text-muted-foreground sm:right-2 sm:text-[11px]"
              style={{ top: (hour - WORKDAY_START_HOUR) * HOUR_HEIGHT }}
            >
              {hourLabel(hour)}
            </div>
          ))}
        </div>
        {days.map((day) => {
          const dayEvents = eventsByDay.get(dateKey(day)) ?? []
          const inSelection = dateIsInSelection(day, dateSelection)
          const showNow =
            isSameDay(day, now) &&
            now.getHours() >= WORKDAY_START_HOUR &&
            now.getHours() <= WORKDAY_END_HOUR
          const nowTop =
            ((now.getHours() * 60 + now.getMinutes() - WORKDAY_START_HOUR * 60) / 60) *
            HOUR_HEIGHT

          return (
            <div
              key={dateKey(day)}
              className={cn("relative select-none border-r", inSelection && "bg-sky-50/50")}
              onDragStart={(event) => event.preventDefault()}
              onPointerDown={(event) => {
                if (event.button !== 0) return
                event.preventDefault()
                onDateSelectionStart(day)
              }}
              onPointerUp={(event) => {
                if (event.button !== 0) return
                onDateSelectionEnd()
              }}
              onPointerEnter={() => onDateSelectionMove(day)}
            >
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="border-b border-border/70"
                  style={{ height: HOUR_HEIGHT }}
                />
              ))}
              {showNow && (
                <div
                  className="absolute left-0 right-0 z-20 h-px bg-[#ea4335]"
                  style={{ top: nowTop }}
                >
                  <span className="absolute -left-1 -top-1.5 size-3 rounded-full bg-[#ea4335]" />
                </div>
              )}
              {dayEvents.map((event) => {
                const position = getEventPosition(event)

                return (
                  <div
                    key={event.id}
                    className="absolute left-1 right-1 z-10 sm:left-1.5 sm:right-1.5"
                    onPointerDown={(pointerEvent) => pointerEvent.stopPropagation()}
                    style={position}
                  >
                    <AppointmentPill event={event} onSelect={onEventSelect} />
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TimeGridView