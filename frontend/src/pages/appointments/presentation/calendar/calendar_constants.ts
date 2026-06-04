import type { AppointmentStatus, AppointmentType } from '@/types/appointments_type';

export const WEEK_STARTS_ON = 0;
export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const WORKDAY_START_HOUR = 7;
export const WORKDAY_END_HOUR = 19;
export const HOUR_HEIGHT = 72;
export const HOURS = Array.from(
  { length: WORKDAY_END_HOUR - WORKDAY_START_HOUR + 1 },
  (_, index) => WORKDAY_START_HOUR + index,
);

export const STATUS_ORDER: AppointmentStatus[] = [
  'scheduled',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
];

export const STATUS_LABEL: Record<AppointmentStatus, string> = {
  scheduled: 'Scheduled',
  confirmed: 'Confirmed',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No show',
};

export const TYPE_LABEL: Record<AppointmentType, string> = {
  first_visit: 'First visit',
  follow_up: 'Follow-up',
  procedure: 'Procedure',
  teleconsult: 'Teleconsult',
};

export const FALLBACK_STATUS = {
  badge: 'border-slate-200 bg-slate-50 text-slate-700',
  dot: 'bg-slate-500',
  event: 'border-slate-200 bg-slate-100 text-slate-800',
};

export const STATUS_STYLE: Record<
  AppointmentStatus,
  { badge: string; dot: string; event: string }
> = {
  scheduled: {
    badge: 'border-sky-200 bg-sky-50 text-sky-700',
    dot: 'bg-sky-500',
    event: 'border-sky-200 bg-sky-100 text-sky-800',
  },
  confirmed: {
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
    event: 'border-emerald-200 bg-emerald-100 text-emerald-800',
  },
  in_progress: {
    badge: 'border-amber-200 bg-amber-50 text-amber-800',
    dot: 'bg-amber-500',
    event: 'border-amber-200 bg-amber-100 text-amber-900',
  },
  completed: {
    badge: 'border-slate-200 bg-slate-50 text-slate-700',
    dot: 'bg-slate-500',
    event: 'border-slate-200 bg-slate-100 text-slate-700',
  },
  cancelled: {
    badge: 'border-rose-200 bg-rose-50 text-rose-700',
    dot: 'bg-rose-500',
    event: 'border-rose-200 bg-rose-100 text-rose-800',
  },
  no_show: {
    badge: 'border-orange-200 bg-orange-50 text-orange-800',
    dot: 'bg-orange-500',
    event: 'border-orange-200 bg-orange-100 text-orange-900',
  },
};
