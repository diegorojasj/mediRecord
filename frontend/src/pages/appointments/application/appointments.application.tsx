import { useEffect, useState } from 'react';

import type { AppointmentOptions } from '@/lib/api/appointments';
import { getAllAppointmentOptions, getAppointments } from '@/lib/api/appointments';
import { getDoctors } from '@/lib/api/doctors';
import { getPatients } from '@/lib/api/patients';
import type { Appointment } from '@/types/appointments_type';
import type { Doctor } from '@/types/doctors_type';
import type { Patient } from '@/types/patients_type';

import CalendarApplication from './calendar.application';

// Names are a nice-to-have on the calendar: if patients/doctors can't be loaded,
// appointments still show (with short ids) instead of failing the whole page
const loadPeople = () =>
  Promise.all([getPatients().catch(() => []), getDoctors().catch(() => [])]);

const loadAll = () => Promise.all([getAppointments(), getAllAppointmentOptions(), loadPeople()]);

const AppointmentsApplication = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [options, setOptions] = useState<AppointmentOptions | null>(null)

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onRefresh = () => {
    setLoading(true);
    setError(null);
    loadAll()
      .then(([a, o, [p, d]]) => {
        setAppointments(a);
        setOptions(o);
        setPatients(p);
        setDoctors(d);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let cancelled = false;

    loadAll()
      .then(([a, o, [p, d]]) => {
        if (cancelled) return;
        setAppointments(a);
        setOptions(o);
        setPatients(p);
        setDoctors(d);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e.message);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 overflow-hidden">
      <CalendarApplication
        appointments={appointments}
        patients={patients}
        doctors={doctors}
        options={options}
        error={error}
        loading={loading}
        onRefresh={onRefresh}
      />
    </div>
  );
};

export default AppointmentsApplication;
