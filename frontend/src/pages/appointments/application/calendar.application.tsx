import type { AppointmentOptions } from '@/lib/api/appointments';
import type { Appointment } from '@/types/appointments_type';
import type { Doctor } from '@/types/doctors_type';
import type { Patient } from '@/types/patients_type';
import CalendarPresentation from '../presentation/calendar.presentation';

const EMPTY_OPTIONS: AppointmentOptions = {
  appointmentStatus: [],
  appointmentType: [],
  cancelledBy: []
};

const CalendarApplication = ({ appointments, patients, doctors, options, error, loading, onRefresh }: {
  appointments: Appointment[]
  patients: Patient[]
  doctors: Doctor[]
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
      patients={patients}
      doctors={doctors}
      error={error}
      loading={loading}
      onRefresh={onRefresh}
    />
  );
};

export default CalendarApplication;
