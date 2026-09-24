import type { SearchSelectOption } from '@/components/searchSelectField';
import { toDateTimeLocal } from '@/lib/utils';
import type { Appointment } from '@/types/appointments_type';
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

// Returns a warning when the appointment falls outside the doctor's working hours
export function scheduleWarning(doctor: Doctor | undefined, start: string, end: string) {
  const minutes = minutesBetween(start, end);
  if (!doctor || minutes === null || minutes <= 0) return null;

  const startDate = new Date(start);
  const endDate = new Date(end);

  const day = WEEK_DAYS[startDate.getDay()];
  const hours = doctor.schedule?.week_days?.[day] ?? [];
  if (hours.length === 0) return `This doctor does not work on ${day}.`;

  // Every hour touched by the appointment must be a working hour
  const lastMinute = new Date(endDate.getTime() - 60_000);
  for (let h = startDate.getHours(); h <= lastMinute.getHours(); h++) {
    if (!hours.includes(h)) return 'Outside this doctor’s working hours.';
  }
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
