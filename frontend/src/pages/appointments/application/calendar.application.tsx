import { useCallback, useEffect, useState } from 'react';

import { getAppointments } from '@/lib/api/appointments';
import type { Appointment } from '@/types/appointments_type';
import CalendarPresentation from '../presentation/calendar.presentation';

const CalendarApplication = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getAppointments()
      .then(setAppointments)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let cancelled = false;

    getAppointments()
      .then((data) => {
        if (cancelled) return;
        setAppointments(data);
      })
      .catch((e: Error) => {
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
    <CalendarPresentation
      appointments={appointments}
      error={error}
      loading={loading}
      onRefresh={load}
    />
  );
};

export default CalendarApplication;
