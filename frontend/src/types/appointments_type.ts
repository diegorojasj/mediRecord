export type AppointmentType = 'first_visit' | 'follow_up' | 'procedure' | 'teleconsult';

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type CancelledBy = 'patient' | 'doctor' | 'system';

export type Appointment = {
  id: string;
  patient_id: string;
  doctor_id: string;
  start_datetime: string;
  end_datetime: string;
  duration_minutes: number;
  type: AppointmentType;
  reason?: string | null;
  status: AppointmentStatus;
  confirmed_at?: string | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
  cancelled_by?: CancelledBy | null;
  encounter_id?: string | null;
  invoice_id?: string | null;
  reminder_sent: boolean;
  reminder_sent_at?: string | null;
  notes?: string | null;
  created_by_id: string;
  created_at: string;
  updated_at: string;
};
