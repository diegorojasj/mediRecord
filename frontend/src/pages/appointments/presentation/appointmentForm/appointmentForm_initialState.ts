import type { FormState } from './appointmentForm_types';

export const INITIAL_STATE: FormState = {
  patient_id: '',
  doctor_id: '',
  start_datetime: '',
  end_datetime: '',
  duration_minutes: '',
  type: '',
  reason: '',
  status: 'scheduled',
  notes: '',
  cancelled_by: '',
  cancellation_reason: '',
};
