import {
  addDays,
  addMonths,
  addWeeks,
  format,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { ChevronLeft, ChevronRight, History, RefreshCw, Search } from 'lucide-react';
import {
  useCallback,
  useMemo,
  useState
} from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { deleteAppointment, type AppointmentOptions } from '@/lib/api/appointments';
import { cn, toDateTimeLocal } from '@/lib/utils';
import CreateFormApplication from '@/pages/appointments/application/creationForm.application';
import { INITIAL_STATE, useFormState } from '@/pages/appointments/presentation/creationForm/creationForm_data';
import { appointmentToFormState } from '@/pages/appointments/presentation/creationForm/creationForm_functions';
import StatusFilters from '@/pages/appointments/presentation/statusFilters';
import type { Appointment, AppointmentStatus } from '@/types/appointments_type';
import type { Doctor } from '@/types/doctors_type';
import type { Patient } from '@/types/patients_type';
import AppointmentDetails from './calendar/appointmentDetails';
import {
  WEEK_STARTS_ON,
} from './calendar/calendar_constants';
import {
  dateKey,
  groupEventsByDay,
  buildDirectory,
  toCalendarEvent,
  visibleRangeLabel,
} from './calendar/calendar_functions';
import type { CalendarEvent, CalendarView } from './calendar/calendar_types';
import HistoryPanel from './calendar/historyPanel';
import MobileStatusStrip from './calendar/mobileStatusStrip';
import MonthView from './calendar/monthView';
import ScheduleView from './calendar/scheduleView';
import SelectionMenu from './calendar/selectionMenu';
import TimeGridView from './calendar/timeGridView';

const CalendarPresentation = ({
  options,
  appointments,
  patients,
  doctors,
  error,
  loading,
  onRefresh,
}: {
  options: AppointmentOptions
  appointments: Appointment[];
  patients: Patient[];
  doctors: Doctor[];
  error?: string | null;
  loading?: boolean;
  onRefresh?: () => void;
}) => {
  const today = startOfDay(new Date());
  const formState = useFormState()
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  // The element that was clicked, so the details open next to it
  const [selectedAnchor, setSelectedAnchor] = useState<HTMLElement | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<CalendarView>('month');
  // Track the unchecked statuses: every status is selected by default, even though
  // the options arrive after the first render
  const [hiddenStatuses, setHiddenStatuses] = useState<Set<AppointmentStatus>>(() => new Set());
  const visibleStatuses = useMemo(
    () =>
      new Set(
        options.appointmentStatus
          .map(({ value }) => value)
          .filter((status) => !hiddenStatuses.has(status)),
      ),
    [options, hiddenStatuses],
  );
  const [selectionMenuPosition, setSelectionMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const directory = useMemo(() => buildDirectory(patients, doctors), [patients, doctors]);
  const calendarEvents = useMemo(
    () =>
      appointments
        .map((appointment) => toCalendarEvent(appointment, directory))
        .filter((event): event is CalendarEvent => event !== null)
        .sort((a, b) => a.start.getTime() - b.start.getTime()),
    [appointments, directory],
  );

  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return calendarEvents.filter((event) => {
      const statusIsKnown = options.appointmentStatus.some(statusOption => statusOption.value === event.status);
      const statusVisible = !statusIsKnown || visibleStatuses.has(event.status);
      const matchesSearch = !query || event.searchText.includes(query);

      return statusVisible && matchesSearch;
    });
  }, [options, calendarEvents, searchQuery, visibleStatuses]);

  const eventsByDay = useMemo(() => groupEventsByDay(filteredEvents), [filteredEvents]);

  const statusCounts = useMemo(() => {
    const counts = Object.fromEntries(
      options.appointmentStatus.map((status) => [status.value, 0]),
    ) as Record<AppointmentStatus, number>;

    for (const event of calendarEvents) {
      if (
        options.appointmentStatus.some(
          (statusOption) => statusOption.value === event.status,
        )
      ) {
        counts[event.status] += 1;
      }
    }

    return counts;
  }, [options, calendarEvents]);

  const selectedDayEvents = eventsByDay.get(dateKey(selectedDate)) ?? [];

  const isAtEarliestPeriod = useCallback(
    (date: Date) => {
      if (view === 'month') {
        return startOfMonth(date).getTime() <= startOfMonth(today).getTime();
      }

      if (view === 'week') {
        return (
          startOfWeek(date, { weekStartsOn: WEEK_STARTS_ON }).getTime() <=
          startOfWeek(today, { weekStartsOn: WEEK_STARTS_ON }).getTime()
        );
      }

      return date.getTime() <= today.getTime();
    },
    [today, view],
  );

  const canGoToPreviousPeriod = !isAtEarliestPeriod(currentDate);

  const navigate = (direction: -1 | 1) => {
    if (direction === -1 && !canGoToPreviousPeriod) return;

    if (view === 'month') {
      setCurrentDate((date) => addMonths(date, direction));
      return;
    }

    if (view === 'week') {
      setCurrentDate((date) => addWeeks(date, direction));
      return;
    }

    setCurrentDate((date) => addDays(date, direction));
  };

  const goToToday = () => {
    const nextToday = startOfDay(new Date());
    setCurrentDate(nextToday);
    setSelectedDate(nextToday);
  };

  // Only one day can be selected at a time: appointments take place on a single day
  const selectDay = useCallback(
    (date: Date, options: { updateCurrentDate?: boolean } = {}) => {
      const day = startOfDay(date);
      if (day.getTime() < today.getTime()) return false;

      setSelectedDate(day);
      if (options.updateCurrentDate) {
        setCurrentDate(day);
      }
      return true;
    },
    [today],
  );

  // The form edits single-day appointments, so only the start day is selected
  const selectFormDate = useCallback(
    (start: Date, _end: Date, options: { updateCurrentDate?: boolean } = {}) => {
      selectDay(start, options);
    },
    [selectDay],
  );

  const selectDate = (date: Date, position?: { x: number; y: number }) => {
    if (!selectDay(date)) return;
    setSelectedEvent(null);
    setSelectionMenuPosition(position ?? null);
  };

  const selectDateAndNavigate = (date: Date) => {
    selectDay(date, { updateCurrentDate: true });
  };

  const scrollMonth = useCallback(
    (direction: -1 | 1) => {
      if (direction === -1 && isAtEarliestPeriod(currentDate)) return;

      setCurrentDate((date) => addMonths(date, direction));
    },
    [currentDate, isAtEarliestPeriod],
  );

  const handleViewChange = (nextView: CalendarView) => {
    setView(nextView);
    setSelectionMenuPosition(null);
  };

  const handleEventSelect = (event: CalendarEvent, anchor?: HTMLElement) => {
    setSelectionMenuPosition(null);
    setSelectedEvent(event);
    setSelectedAnchor(anchor ?? null);
  };

  const handleHistoryEventSelect = (event: CalendarEvent) => {
    setIsHistoryOpen(false);
    handleEventSelect(event);
  };

  // At least one status always stays selected
  const toggleStatus = (status: AppointmentStatus) => {
    if (visibleStatuses.size === 1 && visibleStatuses.has(status)) return;
    setHiddenStatuses((previous) => {
      const next = new Set(previous);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  };

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: WEEK_STARTS_ON });
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }, [currentDate]);

  const handleEditAppointment = (event: CalendarEvent) => {
    formState.set({ ...appointmentToFormState(event), id: event.id });
    // The panel would show stale data after saving; the calendar refreshes instead
    setSelectedEvent(null);
    setSelectionMenuPosition(null);
    formState.set({ isCreatingAppointment: true });
  };

  // Errors are shown by the details panel, which stays open so the user can retry
  const handleDeleteAppointment = async (event: CalendarEvent) => {
    await deleteAppointment(event.id);
    setSelectedEvent(null);
    onRefresh?.();
  };

  const handleCreateAppointment = () => {
    const start = new Date(selectedDate);
    start.setHours(9, 0, 0, 0);
    // Today after 9:00 -> next free quarter hour instead of a time in the past
    const now = new Date();
    if (isSameDay(start, now) && now > start) {
      start.setHours(now.getHours(), Math.ceil((now.getMinutes() + 1) / 15) * 15, 0, 0);
      // Rounding up near midnight must not jump to tomorrow
      if (!isSameDay(start, selectedDate)) start.setTime(now.getTime());
    }
    const end = new Date(start.getTime() + 30 * 60_000);
    // Don't let a late default slot spill into the next day
    if (!isSameDay(start, end)) end.setTime(new Date(start).setHours(23, 59, 0, 0));

    formState.set({
      ...INITIAL_STATE,
      id: undefined,
      duration_minutes: String(Math.round((end.getTime() - start.getTime()) / 60_000)),
      end_datetime: toDateTimeLocal(end),
      start_datetime: toDateTimeLocal(start),
    });
    setSelectionMenuPosition(null);
    formState.set({ isCreatingAppointment: true });
  };

  return (
    <section className="relative flex h-full min-h-0 w-full max-w-full min-w-0 overflow-hidden rounded-md border bg-background text-left text-foreground shadow-sm">
      <aside className="hidden w-64 shrink-0 overflow-y-auto border-r bg-background p-4 2xl:block">
        <div className="mb-5 rounded-md border bg-muted/20 p-3">
          <p className="text-xs font-semibold text-foreground">
            {format(selectedDate, 'EEEE, MMM d')}
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-normal text-foreground">
            {selectedDayEvents.length}
          </p>
          <p className="text-xs text-muted-foreground">
            {selectedDayEvents.length === 1 ? 'appointment' : 'appointments'}
          </p>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold text-foreground">Appointment status</p>
          <StatusFilters
            appointmentStatus={options.appointmentStatus}
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
                  disabled={!canGoToPreviousPeriod}
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
                <Button type="button" variant="ghost" size="icon" onClick={() => navigate(1)}>
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
          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-1.5 sm:gap-2 lg:ml-auto lg:flex">
            <div className="relative min-w-0 flex-1 lg:w-64 lg:flex-none">
              <span className="sr-only">Search appointments</span>
              <Search className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                className="pl-7"
                placeholder="Search appointments"
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
            <Tooltip delayDuration={500}>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsHistoryOpen(true)}
                >
                  <History className="size-4" />
                  <span className="sr-only">View appointment history</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>History</TooltipContent>
            </Tooltip>
            <Tooltip delayDuration={500}>
              <TooltipTrigger asChild>
                <Button type="button" variant="ghost" size="icon" onClick={onRefresh}>
                  <RefreshCw className={cn('size-4', loading && 'animate-spin')} />
                  <span className="sr-only">Refresh appointments</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh</TooltipContent>
            </Tooltip>
            <Select value={view} onValueChange={(value) => handleViewChange(value as CalendarView)}>
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
          appointmentStatus={options.appointmentStatus}
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
          {view === 'month' && (
            <MonthView
              options={options}
              currentDate={currentDate}
              eventsByDay={eventsByDay}
              onDateViewOpen={selectDateAndNavigate}
              onMonthScroll={scrollMonth}
              selectedDate={selectedDate}
              setView={handleViewChange}
              onDateSelect={selectDate}
              onEventSelect={handleEventSelect}
            />
          )}
          {view === 'week' && (
            <TimeGridView
              options={options}
              days={weekDays}
              eventsByDay={eventsByDay}
              onDateViewOpen={(day) => {
                selectDateAndNavigate(day);
                handleViewChange('day');
              }}
              selectedDate={selectedDate}
              onDateSelect={selectDate}
              onEventSelect={handleEventSelect}
            />
          )}
          {view === 'day' && (
            <TimeGridView
              options={options}
              days={[currentDate]}
              eventsByDay={eventsByDay}
              selectedDate={selectedDate}
              onDateSelect={selectDate}
              onEventSelect={handleEventSelect}
            />
          )}
          {view === 'schedule' && (
            <ScheduleView
              options={options}
              currentDate={currentDate}
              eventsByDay={eventsByDay}
              onDateSelect={selectDateAndNavigate}
              onEventSelect={handleEventSelect}
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
        <AppointmentDetails
          // Remount per appointment so a pending delete confirmation doesn't carry over
          key={selectedEvent.id}
          options={options}
          event={selectedEvent}
          anchor={selectedAnchor}
          onEdit={handleEditAppointment}
          onDelete={handleDeleteAppointment}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {selectionMenuPosition && (
        <SelectionMenu
          options={options}
          position={selectionMenuPosition}
          onClose={() => setSelectionMenuPosition(null)}
          onCreateAppointment={handleCreateAppointment}
        />
      )}
      <CreateFormApplication
        options={options}
        appointmentId={formState.id}
        appointments={appointments}
        selectDateRange={selectFormDate}
        onSaved={onRefresh}
      />

      <HistoryPanel
        open={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
        options={options}
        events={calendarEvents}
        onEventSelect={handleHistoryEventSelect}
      />
    </section>
  );
};

export default CalendarPresentation;
