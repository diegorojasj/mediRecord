import { addDays, endOfWeek, format, startOfWeek } from 'date-fns';
import type { SearchSelectOption } from '@/components/searchSelectField';
import type { SelectOption } from '@/lib/utils';
import type { Appointment, AppointmentStatus, AppointmentType } from '@/types/appointments_type';
import type { Doctor } from '@/types/doctors_type';
import type { Patient } from '@/types/patients_type';
import { doctorOption, patientOption } from '../creationForm/creationForm_functions';
import {
  FALLBACK_STATUS,
  HOUR_HEIGHT,
  STATUS_STYLE,
  WEEK_STARTS_ON,
} from './calendar_constants';
import type { CalendarEvent, CalendarView, EventMap } from './calendar_types';

export const dateKey = (date: Date) => {
  return format(date, 'yyyy-MM-dd');
};

export const labeliz = (value: string) => {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

export const statusStyle = (status: string) => {
  return STATUS_STYLE[status as AppointmentStatus] ?? FALLBACK_STATUS;
};

export const shortId = (id: string) => {
  return id ? id.slice(-6) : '------';
};

// Patients and doctors indexed by id, labelled the same way as in the appointment form
export type CalendarDirectory = {
  patients: Map<string, SearchSelectOption>;
  doctors: Map<string, SearchSelectOption>;
};

export const buildDirectory = (patients: Patient[], doctors: Doctor[]): CalendarDirectory => ({
  patients: new Map(patients.map((p) => [p.id, patientOption(p)])),
  doctors: new Map(doctors.map((d) => [d.id, doctorOption(d)])),
});

export const toCalendarEvent = (
  appointment: Appointment,
  directory: CalendarDirectory,
): CalendarEvent | null => {
  const start = new Date(appointment.start_datetime);
  const end = new Date(appointment.end_datetime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  const patient = directory.patients.get(appointment.patient_id);
  const doctor = directory.doctors.get(appointment.doctor_id);
  const patientName = patient?.label ?? `Patient ${shortId(appointment.patient_id)}`;
  const doctorName = doctor?.label ?? `Doctor ${shortId(appointment.doctor_id)}`;

  return {
    ...appointment,
    end,
    patientName,
    patientDetail: patient?.description,
    doctorName,
    doctorDetail: doctor?.description,
    searchText: [
      appointment.id,
      patientName,
      patient?.description,
      patient?.keywords,
      doctorName,
      doctor?.description,
      appointment.reason,
      appointment.status,
      appointment.type,
      appointment.notes,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase(),
    start,
  };
};

export const groupEventsByDay = (events: CalendarEvent[]) => {
  const grouped: EventMap = new Map();

  for (const event of events) {
    const key = dateKey(event.start);
    const dayEvents = grouped.get(key) ?? [];
    dayEvents.push(event);
    grouped.set(key, dayEvents);
  }

  for (const dayEvents of grouped.values()) {
    dayEvents.sort((a, b) => a.start.getTime() - b.start.getTime());
  }

  return grouped;
};

export const formatType = (appointmentTypes: SelectOption<AppointmentType>[], type: AppointmentType) => {
  return appointmentTypes.find((appointmentType) => appointmentType.value === type)?.label
};

export const formatStatus = (appointmentStatuses: SelectOption<AppointmentStatus>[], status: AppointmentStatus) => {
  return appointmentStatuses.find((appointmentStatus) => appointmentStatus.value === status)?.label
};

export const eventTitle = (appointmentTypes: SelectOption<AppointmentType>[], event: CalendarEvent) => {
  return event.reason || formatType(appointmentTypes, event.type)
};

export const hourLabel = (hour: number) => {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  return format(date, 'h a');
};

const DAY_MINUTES = 24 * 60;
const minutesOfDay = (date: Date) => date.getHours() * 60 + date.getMinutes();

// Side-by-side placement of an event among the ones overlapping it
export type EventColumn = { column: number; columns: number };

// Overlapping events share the width of the day: each group of events that overlap
// (directly or through each other) is split into as many columns as it needs
export const layoutEventColumns = (events: CalendarEvent[]) => {
  const layout = new Map<string, EventColumn>();
  const sorted = [...events].sort(
    (a, b) => a.start.getTime() - b.start.getTime() || b.end.getTime() - a.end.getTime(),
  );

  let group: { id: string; column: number }[] = [];
  let groupEnd = -Infinity;
  // End time of the last event placed in each column of the current group
  let columnEnds: number[] = [];

  const closeGroup = () => {
    for (const { id, column } of group) layout.set(id, { column, columns: columnEnds.length });
    group = [];
    columnEnds = [];
  };

  for (const event of sorted) {
    const start = event.start.getTime();
    const end = event.end.getTime();
    if (start >= groupEnd) closeGroup();

    let column = columnEnds.findIndex((columnEnd) => columnEnd <= start);
    if (column === -1) column = columnEnds.push(end) - 1;
    else columnEnds[column] = end;

    group.push({ id: event.id, column });
    groupEnd = Math.max(groupEnd, end);
  }
  closeGroup();

  return layout;
};

// Only upcoming appointments can be deleted: ongoing and past ones stay in the history
export const canDeleteAppointment = (event: CalendarEvent, now = new Date()) =>
  event.start.getTime() > now.getTime();

export const getEventPosition = (event: CalendarEvent, { column, columns }: EventColumn) => {
  const start = minutesOfDay(event.start);
  const end = Math.min(Math.max(minutesOfDay(event.end), start + 15), DAY_MINUTES);

  return {
    height: Math.max(28, ((end - start) / 60) * HOUR_HEIGHT),
    left: `calc(${(column / columns) * 100}% + 2px)`,
    top: (start / 60) * HOUR_HEIGHT,
    width: `calc(${100 / columns}% - 4px)`,
  };
};

export const visibleRangeLabel = (view: CalendarView, currentDate: Date) => {
  if (view === 'month') return format(currentDate, 'MMMM yyyy');
  if (view === 'day') return format(currentDate, 'EEEE, MMMM d');
  if (view === 'schedule')
    return `${format(currentDate, 'MMM d')} - ${format(addDays(currentDate, 20), 'MMM d')}`;

  const start = startOfWeek(currentDate, { weekStartsOn: WEEK_STARTS_ON });
  const end = endOfWeek(currentDate, { weekStartsOn: WEEK_STARTS_ON });
  return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
};
