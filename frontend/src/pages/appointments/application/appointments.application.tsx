import { useEffect, useState } from 'react';

import type { AppointmentOptions } from '@/lib/api/appointments';
import { getAllAppointmentOptions, getAppointments } from '@/lib/api/appointments';
import type { Appointment } from '@/types/appointments_type';

import CalendarApplication from './calendar.application';

const AppointmentsApplication = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [options, setOptions] = useState<AppointmentOptions | null>(null)

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onRefresh = () => {
    setLoading(true);
    setError(null);
    Promise.all([getAppointments(), getAllAppointmentOptions()])
      .then(([p, o]) => {
        setAppointments(p);
        setOptions(o);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let cancelled = false;

    Promise.all([getAppointments(), getAllAppointmentOptions()])
      .then(([p, o]) => {
        if (cancelled) return;
        setAppointments(p);
        setOptions(o);
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
        options={options}
        error={error}
        loading={loading}
        onRefresh={onRefresh}
      />
    </div>
  );
};

export default AppointmentsApplication;
