import { fetchConst } from '@/lib/utils';
import type { FormState } from '@/pages/appointments/presentation/creationForm/creationForm_types';
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

async function errorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body.detail === 'string') return body.detail;
    // FastAPI/Pydantic validation errors: [{ loc: [..., field], msg }, ...]
    if (Array.isArray(body.detail)) {
      return body.detail
        .map((e: { loc?: unknown[]; msg?: string }) => `${e.loc?.at(-1) ?? 'field'}: ${e.msg}`)
        .join('; ');
    }
  } catch {
    // body is not JSON
  }
  return `${res.status}`;
}

export async function getAppointments(): Promise<Appointment[]> {
  const res = await fetch(`${BASE}/`);
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

export async function createAppointments(form: FormState): Promise<Appointment> {
  const res = await fetch(`${BASE}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formToPayload(form)),
  });
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

export async function updateAppointments(id: string, form: FormState): Promise<Appointment> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formToPayload(form)),
  });
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

// Empty optional inputs are sent as null: the backend accepts null, not "" (e.g. cancelled_by is a Literal)
const orNull = (value: string) => value.trim() || null;

function formToPayload(form: FormState) {
  // Cancellation data only makes sense for cancelled appointments; otherwise it is cleared
  const isCancelled = form.status === 'cancelled';
  return {
    patient_id: form.patient_id,
    doctor_id: form.doctor_id,
    start_datetime: form.start_datetime,
    end_datetime: form.end_datetime,
    duration_minutes: form.duration_minutes,
    type: form.type,
    reason: orNull(form.reason),
    status: form.status,
    notes: orNull(form.notes),
    cancelled_by: isCancelled ? orNull(form.cancelled_by) : null,
    cancellation_reason: isCancelled ? orNull(form.cancellation_reason) : null,
  };
}
