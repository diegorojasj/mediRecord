import { fetchConst } from '@/lib/utils';
import type { Appointment, AppointmentStatus, AppointmentType, CancelledBy } from '@/types/appointments_type';

const BASE = '/api/appointments';

export const getConstAppointmentType = () => fetchConst<AppointmentType>(BASE, '/appointment-type');
export const getConstAppointmentStatus = () => fetchConst<AppointmentStatus>(BASE, '/appointment-status');
export const getConstCancelledBy = () => fetchConst<CancelledBy>(BASE, '/cancelled-by');

export async function getAllAppointmentOptions() {
  const [appointmentType, appointmentStatus, cancelledBy] = await Promise.all([
    getConstAppointmentType(),
    getConstAppointmentStatus(),
    getConstCancelledBy(),
  ]);
  return { appointmentType, appointmentStatus, cancelledBy }
}

export type AppointmentOptions = Awaited<ReturnType<typeof getAllAppointmentOptions>>;

export async function getAppointments(): Promise<Appointment[]> {
  const res = await fetch(`${BASE}/`);
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}
