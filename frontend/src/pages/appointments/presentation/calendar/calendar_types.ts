import type { Appointment } from '@/types/appointments_type';

export type CalendarView = 'month' | 'week' | 'day' | 'schedule';

export type CalendarEvent = Appointment & {
  end: Date;
  searchText: string;
  start: Date;
};

export type CalendarDateSelection = {
  end: Date;
  start: Date;
};

export type EventMap = Map<string, CalendarEvent[]>;
