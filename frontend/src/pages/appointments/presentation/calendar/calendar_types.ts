import type { Appointment } from '@/types/appointments_type';

export type CalendarView = 'month' | 'week' | 'day' | 'schedule';

export type CalendarEvent = Appointment & {
  end: Date;
  searchText: string;
  start: Date;
  // Resolved from the patients / doctors databases
  patientName: string;
  patientDetail?: string;
  doctorName: string;
  doctorDetail?: string;
};

export type EventMap = Map<string, CalendarEvent[]>;
