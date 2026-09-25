import type { SearchSelectOption } from '@/components/searchSelectField';
import { toDateTimeLocal } from '@/lib/utils';
import type { Appointment, AppointmentStatus } from '@/types/appointments_type';
import type { Doctor, WeekDay } from '@/types/doctors_type';
import type { Patient } from '@/types/patients_type';
import type { FormState } from './creationForm_types';

const WEEK_DAYS: WeekDay[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const joinName = (...parts: (string | null | undefined)[]) => parts.filter(Boolean).join(' ');

const humanize = (value: string) => {
  const text = value.replaceAll('_', ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export function patientOption(p: Patient): SearchSelectOption {
  return {
    value: p.id,
    label: joinName(p.first_name, p.first_surname, p.second_surname),
    description: `${p.record_number} · CI ${p.national_id}`,
    keywords: p.phone,
  };
}

export function doctorOption(d: Doctor): SearchSelectOption {
  return {
    value: d.id,
    label: joinName(d.first_name, d.first_surname, d.second_surname),
    description: humanize(d.specialty),
    keywords: d.professional_registration_number,
  };
}

// Minutes between two "yyyy-MM-ddTHH:mm" values, or null while incomplete / invalid
export function minutesBetween(start: string, end: string): number | null {
  if (!start || !end) return null;
  const diff = (new Date(end).getTime() - new Date(start).getTime()) / 60_000;
  return Number.isFinite(diff) ? Math.round(diff) : null;
}

// Week day of a "yyyy-MM-dd" date, read in local time
export function weekDayOf(date: string): WeekDay | null {
  const [year, month, day] = date.split('-').map(Number);
  if (!year || !month || !day) return null;
  return WEEK_DAYS[new Date(year, month - 1, day).getDay()];
}

// "yyyy-MM-dd" date moved by a number of days, in local time
export function addDaysToDate(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number);
  const next = new Date(year, month - 1, day + days);
  const mm = String(next.getMonth() + 1).padStart(2, '0');
  const dd = String(next.getDate()).padStart(2, '0');
  return `${next.getFullYear()}-${mm}-${dd}`;
}

// Sorted working hours (0-23) of the doctor on that week day
export function doctorHoursOn(doctor: Doctor | undefined, day: WeekDay | null): number[] {
  if (!doctor || !day) return [];
  return [...new Set(doctor.schedule?.week_days?.[day] ?? [])].sort((a, b) => a - b);
}

export function workingWeekDays(doctor: Doctor | undefined): WeekDay[] {
  return WEEK_DAYS.filter((day) => doctorHoursOn(doctor, day).length > 0);
}

// Consecutive working hours grouped as [start, end) hours, e.g. 8-12 and 14-18
export function hourRanges(hours: number[]): { start: number; end: number }[] {
  const ranges: { start: number; end: number }[] = [];
  for (const hour of hours) {
    const last = ranges.at(-1);
    if (last && last.end === hour) last.end = hour + 1;
    else ranges.push({ start: hour, end: hour + 1 });
  }
  return ranges;
}

// True when every hour touched by [startMinutes, startMinutes + duration) is a working hour
function fitsWorkingHours(hours: number[], startMinutes: number, duration: number) {
  const lastMinute = startMinutes + duration - 1;
  for (let h = Math.floor(startMinutes / 60); h <= Math.floor(lastMinute / 60); h++) {
    if (!hours.includes(h)) return false;
  }
  return true;
}

// Appointments in these statuses no longer hold the doctor's time (same rule as the backend)
const INACTIVE_STATUSES: AppointmentStatus[] = ['cancelled', 'no_show'];

export const holdsDoctorTime = (status: string) =>
  !INACTIVE_STATUSES.includes(status as AppointmentStatus);

// A time span as minutes of the day, [start, end)
export type MinuteRange = { start: number; end: number };

const minutesOfDay = (date: Date) => date.getHours() * 60 + date.getMinutes();

// Times already booked for the doctor on a "yyyy-MM-dd" date, earliest first
export function doctorBookingsOn(
  appointments: Appointment[],
  doctorId: string | undefined,
  date: string,
): MinuteRange[] {
  if (!doctorId) return [];
  return appointments
    .filter((a) => a.doctor_id === doctorId && holdsDoctorTime(a.status))
    .map((a) => ({ start: new Date(a.start_datetime), end: new Date(a.end_datetime) }))
    .filter(({ start }) => toDateTimeLocal(start).slice(0, 10) === date)
    .map(({ start, end }) => ({ start: minutesOfDay(start), end: minutesOfDay(end) }))
    .sort((a, b) => a.start - b.start);
}

// The doctor's active appointment overlapping [start, end), if any.
// Touching ends (one ends at 10:00, the next starts at 10:00) don't overlap
export function doctorConflict(
  appointments: Appointment[],
  form: Pick<FormState, 'doctor_id' | 'start_datetime' | 'end_datetime' | 'status'>,
): Appointment | undefined {
  const minutes = minutesBetween(form.start_datetime, form.end_datetime);
  if (!form.doctor_id || minutes === null || minutes <= 0 || !holdsDoctorTime(form.status)) {
    return undefined;
  }
  const start = new Date(form.start_datetime).getTime();
  const end = new Date(form.end_datetime).getTime();
  return appointments.find(
    (a) =>
      a.doctor_id === form.doctor_id &&
      holdsDoctorTime(a.status) &&
      new Date(a.start_datetime).getTime() < end &&
      new Date(a.end_datetime).getTime() > start,
  );
}

const SLOT_STEP_MINUTES = 15;

// Earliest quarter-hour start, not before minMinutes, where the whole appointment fits in
// the doctor's working hours without overlapping a booking; null when there's no room that day
export function firstAvailableStart(
  hours: number[],
  duration: number,
  minMinutes = 0,
  bookings: MinuteRange[] = [],
) {
  const first = Math.ceil(minMinutes / SLOT_STEP_MINUTES) * SLOT_STEP_MINUTES;
  for (let m = first; m + duration <= DAY_END_MINUTES + 1; m += SLOT_STEP_MINUTES) {
    const free = bookings.every((b) => m + duration <= b.start || m >= b.end);
    if (free && fitsWorkingHours(hours, m, duration)) return m;
  }
  return null;
}

// Returns a warning when the appointment falls outside the doctor's working hours
export function scheduleWarning(doctor: Doctor | undefined, start: string, end: string) {
  const minutes = minutesBetween(start, end);
  if (!doctor || minutes === null || minutes <= 0) return null;

  const startDate = new Date(start);
  const day = WEEK_DAYS[startDate.getDay()];
  const hours = doctorHoursOn(doctor, day);
  if (hours.length === 0) return `This doctor does not work on ${day}.`;

  const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
  if (!fitsWorkingHours(hours, startMinutes, minutes)) return 'Outside this doctor’s working hours.';
  return null;
}

// Appointments always start and end on the same day, so times are handled as minutes of that day
export const DAY_END_MINUTES = 23 * 60 + 59;

export function timeToMinutes(time: string): number | null {
  const [h, m] = time.split(':').map(Number);
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : null;
}

export function minutesToTime(minutes: number): string {
  const clamped = Math.min(Math.max(minutes, 0), DAY_END_MINUTES);
  const h = String(Math.floor(clamped / 60)).padStart(2, '0');
  const m = String(clamped % 60).padStart(2, '0');
  return `${h}:${m}`;
}

// Pre-fills the form when editing an existing appointment
export function appointmentToFormState(a: Appointment): FormState {
  const start = new Date(a.start_datetime);
  const end = new Date(a.end_datetime);
  return {
    patient_id: a.patient_id,
    doctor_id: a.doctor_id,
    start_datetime: toDateTimeLocal(start),
    end_datetime: toDateTimeLocal(end),
    duration_minutes: String(a.duration_minutes),
    type: a.type,
    reason: a.reason ?? '',
    status: a.status,
    notes: a.notes ?? '',
    cancelled_by: a.cancelled_by ?? '',
    cancellation_reason: a.cancellation_reason ?? '',
  };
}
