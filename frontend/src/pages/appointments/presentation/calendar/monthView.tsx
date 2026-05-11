import { useMemo } from "react"
import type { CalendarEvent, CalendarView, EventMap } from "./calendar_types"
import { eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, isToday, startOfMonth, startOfWeek } from "date-fns"
import { WEEK_STARTS_ON, WEEKDAYS } from "./calendar_constants"
import { dateKey } from "./calendar_functions"
import { cn } from "@/lib/utils"
import AppointmentPill from "./appointmentPill"

const MonthView = ({
  currentDate,
  eventsByDay,
  onDateSelect,
  onEventSelect,
  selectedDate,
  setView,
}: {
  currentDate: Date
  eventsByDay: EventMap
  onDateSelect: (date: Date) => void
  onEventSelect: (event: CalendarEvent) => void
  selectedDate: Date
  setView: (view: CalendarView) => void
}) => {
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)

    return eachDayOfInterval({
      end: endOfWeek(monthEnd, { weekStartsOn: WEEK_STARTS_ON }),
      start: startOfWeek(monthStart, { weekStartsOn: WEEK_STARTS_ON }),
    })
  }, [currentDate])

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
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
        {days.map((day) => {
          const dayEvents = eventsByDay.get(dateKey(day)) ?? []
          const visibleEvents = dayEvents.slice(0, 3)
          const hiddenEvents = dayEvents.length - visibleEvents.length
          const outside = !isSameMonth(day, currentDate)

          return (
            <div
              key={dateKey(day)}
              className={cn(
                "min-h-0 overflow-hidden border-b border-r p-1 sm:p-1.5",
                outside && "bg-muted/20 text-muted-foreground",
                isSameDay(day, selectedDate) && "ring-2 ring-sky-500/70 ring-inset"
              )}
            >
              <button
                type="button"
                className={cn(
                  "mb-0.5 inline-flex size-6 items-center justify-center rounded-full text-[11px] font-medium transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 sm:mb-1 sm:size-7 sm:text-xs",
                  isToday(day) && "bg-[#1a73e8] text-white hover:bg-[#1967d2]",
                  isSameDay(day, selectedDate) && !isToday(day) && "bg-sky-100 text-sky-800"
                )}
                onClick={() => onDateSelect(day)}
              >
                {format(day, "d")}
              </button>
              <div className="space-y-0.5 sm:space-y-1">
                {visibleEvents.map((event) => (
                  <AppointmentPill
                    key={event.id}
                    compact
                    event={event}
                    onSelect={onEventSelect}
                  />
                ))}
                {hiddenEvents > 0 && (
                  <button
                    type="button"
                    className="h-5 rounded px-1 text-[10px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground sm:px-1.5 sm:text-[11px]"
                    onClick={() => {
                      onDateSelect(day)
                      setView("day")
                    }}
                  >
                    {hiddenEvents} more
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MonthView
