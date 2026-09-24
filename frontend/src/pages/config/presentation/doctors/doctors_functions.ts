import type { SelectOption } from '@/lib/utils';
import type { Doctor } from '@/types/doctors_type';
import type { FormState, Schedule } from './creationForm/creationForm_types';

export function fullName(d: Doctor) {
  return [d.first_name, d.first_surname, d.second_surname].filter(Boolean).join(' ');
}

export function initials(d: Doctor) {
  return `${d.first_name[0] ?? ''}${d.first_surname[0] ?? ''}`.toUpperCase();
}

export function labelFor(options: SelectOption<string>[], value: string) {
  return options.find((o) => o.value === value)?.label ?? value;
}

export const formatHour = (hour: number) => `${String(hour).padStart(2, '0')}:00`;

// [8, 9, 10, 14, 15] -> "08:00–11:00, 14:00–16:00"
export function formatHourRanges(hours: number[]) {
  const sorted = [...new Set(hours)].sort((a, b) => a - b);
  const ranges: string[] = [];
  let start = sorted[0];
  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    if (sorted[i + 1] !== current + 1) {
      ranges.push(`${formatHour(start)}–${formatHour(current + 1)}`);
      start = sorted[i + 1];
    }
  }
  return ranges.join(', ');
}

export function workingDaysCount(schedule: Schedule) {
  return Object.values(schedule).filter((hours) => hours && hours.length > 0).length;
}

export function doctorToFormState(d: Doctor): FormState {
  return {
    first_name: d.first_name,
    first_surname: d.first_surname,
    second_surname: d.second_surname ?? '',
    specialty: d.specialty,
    professional_registration_number: d.professional_registration_number,
    status: d.status,
    phone: d.phone,
    schedule: d.schedule?.week_days ?? {},
  };
}
