import type { Appointment } from '@/types/appointments_type';

const BASE = '/api/appointments';

export type SelectOption = { value: string; label: string };

function labelize(value: string) {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function toOptions(values: string[]): SelectOption[] {
  return values.map((value) => ({ value, label: labelize(value) }));
}

async function fetchConst(path: string): Promise<SelectOption[]> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status}`);
  return toOptions(await res.json());
}

export const getConstAppointmentType = () => fetchConst('/appointment-type');
export const getConstAppointmentStatus = () => fetchConst('/appointment-status');
export const getConstCancelledBy = () => fetchConst('/cancelled-by');

export async function getAppointments(): Promise<Appointment[]> {
  const res = await fetch(`${BASE}/`);
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}
