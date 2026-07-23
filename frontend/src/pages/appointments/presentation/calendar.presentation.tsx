import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  format,
  isSameDay,
  startOfDay,
  startOfWeek,
} from 'date-fns';
import { ChevronLeft, ChevronRight, RefreshCw, Search } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type SyntheticEvent,
} from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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
import { cn } from '@/lib/utils';
import type { Appointment, AppointmentStatus } from '@/types/appointments_type';
import type { CalendarDateSelection, CalendarEvent, CalendarView } from './calendar/calendar_types';
import {
  CANCELLED_BY_LABEL,
  CANCELLED_BY_ORDER,
  STATUS_LABEL,
  STATUS_ORDER,
  TYPE_LABEL,
  TYPE_ORDER,
  WEEK_STARTS_ON,
} from './calendar/calendar_constants';
import {
  dateKey,
  formatStatus,
  groupEventsByDay,
  statusStyle,
  toCalendarEvent,
  visibleRangeLabel,
} from './calendar/calendar_functions';
import MobileStatusStrip from './calendar/mobileStatusStrip';
import MonthView from './calendar/monthView';
import TimeGridView from './calendar/timeGridView';
import ScheduleView from './calendar/scheduleView';
import AppointmentDetails from './calendar/appointmentDetails';
import SelectionMenu from './calendar/selectionMenu';
import AppointmentFormPresentation from './appointmentForm.presentation';
import type { FormState } from './appointmentForm/appointmentForm_types';
import { INITIAL_STATE as APPOINTMENT_FORM_INITIAL_STATE } from './appointmentForm/appointmentForm_initialState';

const APPOINTMENT_FORM_OPTIONS = {
  type: TYPE_ORDER.map((value) => ({ value, label: TYPE_LABEL[value] })),
  status: STATUS_ORDER.map((value) => ({ value, label: STATUS_LABEL[value] })),
  cancelledBy: CANCELLED_BY_ORDER.map((value) => ({ value, label: CANCELLED_BY_LABEL[value] })),
};

const toDateTimeLocal = (date: Date) => format(date, "yyyy-MM-dd'T'HH:mm");

const parseDateOnly = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

function StatusFilters({
  statusCounts,
  toggleStatus,
  visibleStatuses,
}: {
  statusCounts: Record<AppointmentStatus, number>;
  toggleStatus: (status: AppointmentStatus) => void;
  visibleStatuses: Set<AppointmentStatus>;
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
          <span className={cn('size-2.5 rounded-full', statusStyle(status).dot)} />
          <span className="min-w-0 flex-1 truncate">{formatStatus(status)}</span>
          <span className="text-muted-foreground">{statusCounts[status]}</span>
        </label>
      ))}
    </div>
  );
}

const CalendarPresentation = ({
  appointments,
  error,
  loading,
  onRefresh,
}: {
  appointments: Appointment[];
  error?: string | null;
  loading?: boolean;
  onRefresh?: () => void;
}) => {
  const today = startOfDay(new Date());
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedDateRange, setSelectedDateRange] = useState<CalendarDateSelection>(() => ({
    end: today,
    start: today,
  }));
  const [dragDateRange, setDragDateRange] = useState<CalendarDateSelection | null>(null);
  const [isSelectingDates, setIsSelectingDates] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<CalendarView>('month');
  const dateSelectionAnchorRef = useRef<Date | null>(null);
  const dateSelectionEndRef = useRef<Date | null>(null);
  const [visibleStatuses, setVisibleStatuses] = useState<Set<AppointmentStatus>>(
    () => new Set(STATUS_ORDER),
  );
  const [selectionMenuPosition, setSelectionMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState<FormState>(
    APPOINTMENT_FORM_INITIAL_STATE,
  );

  const calendarEvents = useMemo(
    () =>
      appointments
        .map(toCalendarEvent)
        .filter((event): event is CalendarEvent => event !== null)
        .sort((a, b) => a.start.getTime() - b.start.getTime()),
    [appointments],
  );

  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return calendarEvents.filter((event) => {
      const statusIsKnown = STATUS_ORDER.includes(event.status);
      const statusVisible = !statusIsKnown || visibleStatuses.has(event.status);
      const matchesSearch = !query || event.searchText.includes(query);

      return statusVisible && matchesSearch;
    });
  }, [calendarEvents, searchQuery, visibleStatuses]);

  const eventsByDay = useMemo(() => groupEventsByDay(filteredEvents), [filteredEvents]);

  const statusCounts = useMemo(() => {
    const counts = Object.fromEntries(STATUS_ORDER.map((status) => [status, 0])) as Record<
      AppointmentStatus,
      number
    >;

    for (const event of calendarEvents) {
      if (STATUS_ORDER.includes(event.status)) {
        counts[event.status] += 1;
      }
    }

    return counts;
  }, [calendarEvents]);

  const activeDateRange = dragDateRange ?? selectedDateRange;
  const selectedRangeDays = useMemo(
    () =>
      eachDayOfInterval({
        end: activeDateRange.end,
        start: activeDateRange.start,
      }),
    [activeDateRange],
  );
  const selectedRangeEvents = useMemo(
    () => selectedRangeDays.flatMap((day) => eventsByDay.get(dateKey(day)) ?? []),
    [eventsByDay, selectedRangeDays],
  );
  const selectionIsSingleDay = isSameDay(activeDateRange.start, activeDateRange.end);
  const selectedRangeLabel = selectionIsSingleDay
    ? format(activeDateRange.start, 'EEEE, MMM d')
    : `${format(activeDateRange.start, 'MMM d')} - ${format(
        activeDateRange.end,
        activeDateRange.start.getFullYear() === activeDateRange.end.getFullYear()
          ? 'MMM d'
          : 'MMM d, yyyy',
      )}`;

  const normalizeDateSelection = useCallback((start: Date, end: Date) => {
    const normalizedStart = startOfDay(start);
    const normalizedEnd = startOfDay(end);

    if (normalizedStart.getTime() <= normalizedEnd.getTime()) {
      return { end: normalizedEnd, start: normalizedStart };
    }

    return { end: normalizedStart, start: normalizedEnd };
  }, []);

  const navigate = (direction: -1 | 1) => {
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
    dateSelectionAnchorRef.current = null;
    dateSelectionEndRef.current = null;
    setCurrentDate(nextToday);
    setSelectedDate(nextToday);
    setSelectedDateRange({ end: nextToday, start: nextToday });
    setDragDateRange(null);
  };

  const selectDateRange = useCallback(
    (start: Date, end: Date, options: { updateCurrentDate?: boolean } = {}) => {
      const nextRange = normalizeDateSelection(start, end);
      dateSelectionAnchorRef.current = null;
      dateSelectionEndRef.current = null;
      setSelectedDate(nextRange.start);
      setSelectedDateRange(nextRange);
      setDragDateRange(null);
      if (options.updateCurrentDate) {
        setCurrentDate(nextRange.start);
      }
    },
    [normalizeDateSelection],
  );

  const selectDate = (date: Date) => {
    if (startOfDay(date).getTime() < today.getTime()) return;
    selectDateRange(date, date);
  };

  const selectDateAndNavigate = (date: Date) => {
    if (startOfDay(date).getTime() < today.getTime()) return;
    selectDateRange(date, date, { updateCurrentDate: true });
  };

  const beginDateSelection = useCallback(
    (date: Date) => {
      const day = startOfDay(date);
      if (day.getTime() < today.getTime()) return;

      const nextRange = { end: day, start: day };

      dateSelectionAnchorRef.current = day;
      dateSelectionEndRef.current = day;
      setSelectedDate(day);
      setDragDateRange(nextRange);
      setIsSelectingDates(true);
      setSelectedEvent(null);
      setSelectionMenuPosition(null);
    },
    [today],
  );

  const moveDateSelection = useCallback(
    (date: Date) => {
      const anchor = dateSelectionAnchorRef.current;
      if (!anchor) return;

      const day = startOfDay(date);
      if (day.getTime() < today.getTime()) return;

      dateSelectionEndRef.current = day;
      setSelectedDate(day);
      setDragDateRange(normalizeDateSelection(anchor, day));
    },
    [normalizeDateSelection, today],
  );

  const scrollMonth = useCallback(
    (direction: -1 | 1, selectionDate?: Date) => {
      setCurrentDate((date) => addMonths(date, direction));

      if (selectionDate && dateSelectionAnchorRef.current) {
        moveDateSelection(selectionDate);
      }
    },
    [moveDateSelection],
  );

  const commitDateSelection = useCallback(
    (position?: { x: number; y: number }) => {
      const anchor = dateSelectionAnchorRef.current;
      const end = dateSelectionEndRef.current;

      if (!anchor || !end) {
        setDragDateRange(null);
        setIsSelectingDates(false);
        return;
      }

      const nextRange = normalizeDateSelection(anchor, end);
      dateSelectionAnchorRef.current = null;
      dateSelectionEndRef.current = null;
      setSelectedDate(nextRange.start);
      setSelectedDateRange(nextRange);
      setDragDateRange(null);
      setIsSelectingDates(false);
      if (position) {
        setSelectionMenuPosition(position);
      }
    },
    [normalizeDateSelection],
  );

  useEffect(() => {
    if (!isSelectingDates) return;

    const handleWindowPointerUp = (event: PointerEvent) => {
      commitDateSelection({ x: event.clientX, y: event.clientY });
    };
    const handleWindowPointerCancel = () => {
      commitDateSelection();
    };

    window.addEventListener('pointerup', handleWindowPointerUp);
    window.addEventListener('pointercancel', handleWindowPointerCancel);

    return () => {
      window.removeEventListener('pointerup', handleWindowPointerUp);
      window.removeEventListener('pointercancel', handleWindowPointerCancel);
    };
  }, [commitDateSelection, isSelectingDates]);

  const handleViewChange = (nextView: CalendarView) => {
    dateSelectionAnchorRef.current = null;
    dateSelectionEndRef.current = null;
    setView(nextView);
    setDragDateRange(null);
    setIsSelectingDates(false);
    setSelectionMenuPosition(null);
  };

  const handleEventSelect = (event: CalendarEvent) => {
    setSelectionMenuPosition(null);
    setSelectedEvent(event);
  };

  const toggleStatus = (status: AppointmentStatus) => {
    setVisibleStatuses((previous) => {
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

  const handleCreateAppointment = () => {
    const start = new Date(activeDateRange.start);
    start.setHours(9, 0, 0, 0);
    const end = new Date(activeDateRange.end);
    end.setHours(9, 30, 0, 0);

    setAppointmentForm({
      ...APPOINTMENT_FORM_INITIAL_STATE,
      duration_minutes: '30',
      end_datetime: toDateTimeLocal(end),
      start_datetime: toDateTimeLocal(start),
    });
    setSelectionMenuPosition(null);
    setIsCreatingAppointment(true);
  };

  const handleAppointmentDateRangeChange = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return;
    selectDateRange(parseDateOnly(startDate), parseDateOnly(endDate), { updateCurrentDate: true });
  };

  const setAppointmentField =
    (key: keyof FormState) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setAppointmentForm((previous) => ({ ...previous, [key]: e.target.value }));

  const setAppointmentSelectField = (key: keyof FormState) => (value: string) =>
    setAppointmentForm((previous) => ({ ...previous, [key]: value }));

  const handleAppointmentFormSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsCreatingAppointment(false);
  };

  return (
    <section className="relative flex h-full min-h-0 w-full max-w-full min-w-0 overflow-hidden rounded-md border bg-background text-left text-foreground shadow-sm">
      <aside className="hidden w-64 shrink-0 overflow-y-auto border-r bg-background p-4 2xl:block">
        <div className="mb-5 rounded-md border bg-muted/20 p-3">
          <p className="text-xs font-semibold text-foreground">{selectedRangeLabel}</p>
          {!selectionIsSingleDay && (
            <p className="mt-1 text-xs text-muted-foreground">
              {selectedRangeDays.length} days selected
            </p>
          )}
          <p className="mt-1 text-2xl font-semibold tracking-normal text-foreground">
            {selectedRangeEvents.length}
          </p>
          <p className="text-xs text-muted-foreground">
            {selectedRangeEvents.length === 1 ? 'appointment' : 'appointments'}
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
                <Button type="button" variant="ghost" size="icon" onClick={() => navigate(-1)}>
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
              currentDate={currentDate}
              dateSelection={activeDateRange}
              eventsByDay={eventsByDay}
              onDateSelectionEnd={commitDateSelection}
              onDateSelectionMove={moveDateSelection}
              onDateSelectionStart={beginDateSelection}
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
              dateSelection={activeDateRange}
              days={weekDays}
              eventsByDay={eventsByDay}
              onDateSelectionEnd={commitDateSelection}
              onDateSelectionMove={moveDateSelection}
              onDateSelectionStart={beginDateSelection}
              selectedDate={selectedDate}
              onDateSelect={selectDate}
              onEventSelect={handleEventSelect}
            />
          )}
          {view === 'day' && (
            <TimeGridView
              dateSelection={activeDateRange}
              days={[currentDate]}
              eventsByDay={eventsByDay}
              onDateSelectionEnd={commitDateSelection}
              onDateSelectionMove={moveDateSelection}
              onDateSelectionStart={beginDateSelection}
              selectedDate={selectedDate}
              onDateSelect={selectDate}
              onEventSelect={handleEventSelect}
            />
          )}
          {view === 'schedule' && (
            <ScheduleView
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
        <AppointmentDetails event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}

      {selectionMenuPosition && (
        <SelectionMenu
          position={selectionMenuPosition}
          onClose={() => setSelectionMenuPosition(null)}
          onCreateAppointment={handleCreateAppointment}
        />
      )}

      <Dialog open={isCreatingAppointment} onOpenChange={setIsCreatingAppointment}>
        <DialogContent className="flex max-h-[85vh] w-full flex-col overflow-hidden sm:max-w-xl">
          <AppointmentFormPresentation
            form={appointmentForm}
            set={setAppointmentField}
            setSelect={setAppointmentSelectField}
            onSubmit={handleAppointmentFormSubmit}
            onDateRangeChange={handleAppointmentDateRangeChange}
            options={APPOINTMENT_FORM_OPTIONS}
          />
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default CalendarPresentation;
