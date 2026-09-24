import type { WeekDay } from '@/types/doctors_type';

export type Schedule = Partial<Record<WeekDay, number[]>>;

export type FormState = {
  // Identification
  first_name: string;
  first_surname: string;
  second_surname: string;
  // Professional
  specialty: string;
  professional_registration_number: string;
  status: string;
  // Contact
  phone: string;
  // Agenda
  schedule: Schedule;
};

// Fields edited through plain inputs / selects (everything but the schedule)
export type TextField = Exclude<keyof FormState, 'schedule'>;
