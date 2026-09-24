import { fetchConst, type SelectOption } from '@/lib/utils';
import type { FormState } from '@/pages/config/presentation/doctors/creationForm/creationForm_types';
import type { Doctor, DoctorStatus, WeekDay } from '@/types/doctors_type';

const BASE = '/api/config';

// Constants come as snake_case ("general_practice"), show them as "General practice"
const humanize = <T extends string>(options: SelectOption<T>[]) =>
  options.map((o) => ({ ...o, label: o.label.replaceAll('_', ' ') }));

export const getConstWeekDays = () => fetchConst<WeekDay>(BASE, '/week-days');
export const getConstDoctorSpecialty = () => fetchConst(BASE, '/doctor-specialty').then(humanize);
export const getConstDoctorStatus = () => fetchConst<DoctorStatus>(BASE, '/doctor-status').then(humanize);

export async function getAllDoctorOptions() {
  const [weekDays, specialty, status] = await Promise.all([
    getConstWeekDays(),
    getConstDoctorSpecialty(),
    getConstDoctorStatus(),
  ]);
  return { weekDays, specialty, status };
}

export type DoctorOptions = Awaited<ReturnType<typeof getAllDoctorOptions>>;

async function errorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body.detail === 'string') return body.detail;
  } catch {
    // body is not JSON
  }
  return `${res.status}`;
}

export async function getDoctors(): Promise<Doctor[]> {
  const res = await fetch(`${BASE}/doctors/`);
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

export async function createDoctor(form: FormState): Promise<Doctor> {
  const res = await fetch(`${BASE}/doctors/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formToPayload(form)),
  });
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

export async function updateDoctor(id: string, form: FormState): Promise<Doctor> {
  const res = await fetch(`${BASE}/doctors/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formToPayload(form)),
  });
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

export async function deleteDoctor(id: string): Promise<void> {
  const res = await fetch(`${BASE}/doctors/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await errorMessage(res));
}

function formToPayload(form: FormState) {
  return {
    first_name: form.first_name,
    first_surname: form.first_surname,
    second_surname: form.second_surname || null,
    specialty: form.specialty,
    professional_registration_number: form.professional_registration_number,
    phone: form.phone,
    schedule: { week_days: form.schedule },
    status: form.status,
  };
}
