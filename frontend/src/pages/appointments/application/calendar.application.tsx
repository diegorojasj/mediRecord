import type { AppointmentOptions } from '@/lib/api/appointments';
import type { Appointment } from '@/types/appointments_type';
import CalendarPresentation from '../presentation/calendar.presentation';

const EMPTY_OPTIONS: AppointmentOptions = {
  appointmentStatus: [],
  appointmentType: [],
  cancelledBy: []
};

const CalendarApplication = ({ appointments, options, error, loading, onRefresh }: {
  appointments: Appointment[]
  options: AppointmentOptions | null,
  error: string | null,
  loading: boolean,
  onRefresh?: () => void
}) => {

  const resolvedOptions = options ?? EMPTY_OPTIONS;

  return (
    <CalendarPresentation
      options={resolvedOptions}
      appointments={appointments}
      error={error}
      loading={loading}
      onRefresh={onRefresh}
    />
  );
};

export default CalendarApplication;
