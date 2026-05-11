import {
  addDays,
  addMonths,
  addWeeks,
  format,
  startOfDay,
  startOfWeek,
} from "date-fns"
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
} from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Calendar as MiniCalendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type {
  Appointment,
  AppointmentStatus,
} from "@/types/appointments_type"
import type { CalendarEvent, CalendarView } from "./calendar/calendar_types"
import {
  STATUS_ORDER,
  WEEK_STARTS_ON,
} from "./calendar/calendar_constants"
import {
  dateKey,
  formatStatus,
  groupEventsByDay,
  statusStyle,
  toCalendarEvent,
  visibleRangeLabel,
} from "./calendar/calendar_functions"
import MobileStatusStrip from "./calendar/mobileStatusStrip"
import MonthView from "./calendar/monthView"
import TimeGridView from "./calendar/timeGridView"
import ScheduleView from "./calendar/scheduleView"
import AppointmentDetails from "./calendar/appointmentDetails"

function StatusFilters({
  statusCounts,
  toggleStatus,
  visibleStatuses,
}: {
  statusCounts: Record<AppointmentStatus, number>
  toggleStatus: (status: AppointmentStatus) => void
  visibleStatuses: Set<AppointmentStatus>
}) {
  return (
    <div className="space-y-1">
      {STATUS_ORDER.map((status) => (
        <label
          key={status}
          className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-xs hover:bg-muted/70"
        >
          <input
            type="checkbox"
            checked={visibleStatuses.has(status)}
            className="size-3.5 rounded border-border accent-[#1a73e8]"
            onChange={() => toggleStatus(status)}
          />
          <span className={cn("size-2.5 rounded-full", statusStyle(status).dot)} />
          <span className="min-w-0 flex-1 truncate">{formatStatus(status)}</span>
          <span className="text-muted-foreground">{statusCounts[status]}</span>
        </label>
      ))}
    </div>
  )
}

const CalendarPresentation = ({
  appointments,
  error,
  loading,
  onRefresh,
}: {
  appointments: Appointment[]
  error?: string | null
  loading?: boolean
  onRefresh?: () => void
}) => {
  const today = startOfDay(new Date())
  const [currentDate, setCurrentDate] = useState(today)
  const [selectedDate, setSelectedDate] = useState(today)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [view, setView] = useState<CalendarView>("month")
  const [visibleStatuses, setVisibleStatuses] = useState<Set<AppointmentStatus>>(
    () => new Set(STATUS_ORDER)
  )

  const calendarEvents = useMemo(
    () =>
      appointments
        .map(toCalendarEvent)
        .filter((event): event is CalendarEvent => event !== null)
        .sort((a, b) => a.start.getTime() - b.start.getTime()),
    [appointments]
  )

  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return calendarEvents.filter((event) => {
      const statusIsKnown = STATUS_ORDER.includes(event.status)
      const statusVisible = !statusIsKnown || visibleStatuses.has(event.status)
      const matchesSearch = !query || event.searchText.includes(query)

      return statusVisible && matchesSearch
    })
  }, [calendarEvents, searchQuery, visibleStatuses])

  const eventsByDay = useMemo(() => groupEventsByDay(filteredEvents), [filteredEvents])

  const statusCounts = useMemo(() => {
    const counts = Object.fromEntries(
      STATUS_ORDER.map((status) => [status, 0])
    ) as Record<AppointmentStatus, number>

    for (const event of calendarEvents) {
      if (STATUS_ORDER.includes(event.status)) {
        counts[event.status] += 1
      }
    }

    return counts
  }, [calendarEvents])

  const selectedDayEvents = eventsByDay.get(dateKey(selectedDate)) ?? []

  const navigate = (direction: -1 | 1) => {
    if (view === "month") {
      setCurrentDate((date) => addMonths(date, direction))
      return
    }

    if (view === "week") {
      setCurrentDate((date) => addWeeks(date, direction))
      return
    }

    setCurrentDate((date) => addDays(date, direction))
  }

  const goToToday = () => {
    const nextToday = startOfDay(new Date())
    setCurrentDate(nextToday)
    setSelectedDate(nextToday)
  }

  const selectDate = (date: Date) => {
    setSelectedDate(date)
    setCurrentDate(date)
  }

  const toggleStatus = (status: AppointmentStatus) => {
    setVisibleStatuses((previous) => {
      const next = new Set(previous)
      if (next.has(status)) next.delete(status)
      else next.add(status)
      return next
    })
  }

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: WEEK_STARTS_ON })
    return Array.from({ length: 7 }, (_, index) => addDays(start, index))
  }, [currentDate])

  return (
    <section className="relative flex h-full min-h-0 w-full max-w-full min-w-0 overflow-hidden rounded-md border bg-background text-left text-foreground shadow-sm">
      <aside className="hidden w-64 shrink-0 overflow-y-auto border-r bg-background p-4 2xl:block">
        <MiniCalendar
          mode="single"
          month={currentDate}
          selected={selectedDate}
          onMonthChange={setCurrentDate}
          onSelect={(date) => {
            if (!date) return
            selectDate(date)
          }}
          className="mb-5 p-0 [--cell-size:--spacing(7)]"
        />

        <div className="mb-5 rounded-md border bg-muted/20 p-3">
          <p className="text-xs font-semibold text-foreground">
            {format(selectedDate, "EEEE, MMM d")}
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-normal text-foreground">
            {selectedDayEvents.length}
          </p>
          <p className="text-xs text-muted-foreground">
            {selectedDayEvents.length === 1 ? "appointment" : "appointments"}
          </p>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold text-foreground">Appointment status</p>
          <StatusFilters
            statusCounts={statusCounts}
            toggleStatus={toggleStatus}
            visibleStatuses={visibleStatuses}
          />
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-col gap-2 border-b px-2 py-2 sm:px-3 lg:flex-row lg:items-center">
          <div className="flex w-full min-w-0 items-center gap-1.5 lg:w-auto">
            <Button type="button" variant="outline" onClick={goToToday}>
              Today
            </Button>
            <Tooltip delayDuration={500}>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(-1)}
                >
                  <ChevronLeft className="size-4" />
                  <span className="sr-only">Previous period</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Previous</TooltipContent>
            </Tooltip>
            <Tooltip delayDuration={500}>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(1)}
                >
                  <ChevronRight className="size-4" />
                  <span className="sr-only">Next period</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Next</TooltipContent>
            </Tooltip>
            <div className="min-w-0 flex-1 truncate pl-1 text-sm font-normal text-foreground sm:text-base lg:min-w-[10rem]">
              {visibleRangeLabel(view, currentDate)}
            </div>
          </div>
          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-1.5 sm:gap-2 lg:ml-auto lg:flex">
            <label className="relative min-w-0 flex-1 lg:w-64 lg:flex-none">
              <span className="sr-only">Search appointments</span>
              <Search className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                className="pl-7"
                placeholder="Search appointments"
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>
            <Tooltip delayDuration={500}>
              <TooltipTrigger asChild>
                <Button type="button" variant="ghost" size="icon" onClick={onRefresh}>
                  <RefreshCw className={cn("size-4", loading && "animate-spin")} />
                  <span className="sr-only">Refresh appointments</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh</TooltipContent>
            </Tooltip>
            <Select
              value={view}
              onValueChange={(value) => setView(value as CalendarView)}
            >
              <SelectTrigger className="h-8 w-[6.5rem] shrink-0 sm:w-32" aria-label="Calendar view">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="schedule">Schedule</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <MobileStatusStrip
          statusCounts={statusCounts}
          toggleStatus={toggleStatus}
          visibleStatuses={visibleStatuses}
        />

        {error && (
          <div className="border-b bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 sm:px-4">
            Could not load appointments: {error}
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-auto">
          {view === "month" && (
            <MonthView
              currentDate={currentDate}
              eventsByDay={eventsByDay}
              selectedDate={selectedDate}
              setView={setView}
              onDateSelect={selectDate}
              onEventSelect={setSelectedEvent}
            />
          )}
          {view === "week" && (
            <TimeGridView
              days={weekDays}
              eventsByDay={eventsByDay}
              selectedDate={selectedDate}
              onDateSelect={selectDate}
              onEventSelect={setSelectedEvent}
            />
          )}
          {view === "day" && (
            <TimeGridView
              days={[currentDate]}
              eventsByDay={eventsByDay}
              selectedDate={selectedDate}
              onDateSelect={selectDate}
              onEventSelect={setSelectedEvent}
            />
          )}
          {view === "schedule" && (
            <ScheduleView
              currentDate={currentDate}
              eventsByDay={eventsByDay}
              onDateSelect={selectDate}
              onEventSelect={setSelectedEvent}
            />
          )}
        </div>
      </main>

      {loading && (
        <div className="absolute bottom-0 left-64 right-0 top-[3.25rem] hidden bg-background/70 p-4 backdrop-blur-[1px] 2xl:block">
          <Skeleton className="h-full w-full" />
        </div>
      )}

      {loading && (
        <div className="absolute inset-x-0 bottom-0 top-[8rem] bg-background/70 p-3 backdrop-blur-[1px] lg:top-[5.75rem] 2xl:hidden">
          <Skeleton className="h-full w-full" />
        </div>
      )}

      {selectedEvent && (
        <AppointmentDetails event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </section>
  )
}

export default CalendarPresentation
