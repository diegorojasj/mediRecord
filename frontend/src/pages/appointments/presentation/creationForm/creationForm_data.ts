import { create } from 'zustand';
import type { FormState } from './creationForm_types';

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

export const useFormState = create<FormState & { id?: string, isCreatingAppointment: boolean, set: (newFormState: (FormState & { id?: string }) | { isCreatingAppointment: boolean }) => void }>((set) => ({
  ...INITIAL_STATE,
  isCreatingAppointment: false,
  set: (newFormState) => set(newFormState)
}))
