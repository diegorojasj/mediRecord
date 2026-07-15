export type FormState = {
  // Identification
  patient_id: string;
  doctor_id: string;
  // Schedule
  start_datetime: string;
  end_datetime: string;
  duration_minutes: string;
  // Details
  type: string;
  reason: string;
  status: string;
  notes: string;
  // Cancellation
  cancelled_by: string;
  cancellation_reason: string;
};
