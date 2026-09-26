import { type ChangeEvent, type SyntheticEvent, useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { type AppointmentOptions, createAppointments, updateAppointments } from '@/lib/api/appointments';
import { getDoctors } from '@/lib/api/doctors';
import { getPatients } from '@/lib/api/patients';
import type { FormState, SelectDateRangeType } from '@/pages/appointments/presentation/creationForm/creationForm_types';
import CreateFormPresentation from '@/pages/appointments/presentation/creationForm.presentation';
import type { Appointment } from '@/types/appointments_type';
import type { Doctor } from '@/types/doctors_type';
import type { Patient } from '@/types/patients_type';
import { useFormState } from '../presentation/creationForm/creationForm_data';
import { hasAppointmentStarted } from '../presentation/calendar/calendar_functions';
import { minutesBetween } from '../presentation/creationForm/creationForm_functions';


const CreateFormApplication = ({ appointmentId, appointments, options, selectDateRange, onSaved }: { appointmentId?: string, appointments: Appointment[], options: AppointmentOptions, selectDateRange: SelectDateRangeType, onSaved?: () => void }) => {
  const formState = useFormState()
  // null until the first load finishes
  const [people, setPeople] = useState<{ patients: Patient[]; doctors: Doctor[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Patients and doctors come from the database each time the form opens
  useEffect(() => {
    if (!formState.isCreatingAppointment) return;
    let cancelled = false;
    Promise.all([getPatients(), getDoctors()])
      .then(([patients, doctors]) => {
        if (cancelled) return;
        setPeople({ patients, doctors });
        setError(null);
      })
      .catch((e) => {
        if (cancelled) return;
        setPeople((prev) => prev ?? { patients: [], doctors: [] });
        setError(`Could not load patients and doctors (${e.message})`);
      });
    return () => {
      cancelled = true;
    };
  }, [formState.isCreatingAppointment]);

  const parseDateOnly = (value: string) => {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const handleAppointmentDateRangeChange = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return;
    selectDateRange(parseDateOnly(startDate), parseDateOnly(endDate), { updateCurrentDate: true });
  };

  const setAppointmentField =
    (key: keyof FormState) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      // Read the latest state: date/time handlers may update start and end back to back
      const next = { ...useFormState.getState(), [key]: e.target.value };
      // Duration is derived by the system from start/end, never typed by the user
      if (key === 'start_datetime' || key === 'end_datetime') {
        const minutes = minutesBetween(next.start_datetime, next.end_datetime);
        next.duration_minutes = minutes !== null && minutes > 0 ? String(minutes) : '';
      }
      formState.set(next);
    };

  const setAppointmentSelectField = (key: keyof FormState) => (value: string) =>
    formState.set({ ...useFormState.getState(), [key]: value });

  const onSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    try {
      if (appointmentId) {
        await updateAppointments(appointmentId, formState);
      } else {
        await createAppointments(formState);
      }
      formState.set({ isCreatingAppointment: false });
      onSaved?.();
    } catch (err) {
      setError(`Failed to save appointment (${err instanceof Error ? err.message : err})`);
    }
  };

  // Decided by the saved start, not the form's: moving the time in the form doesn't unlock it
  const savedAppointment = appointments.find((a) => a.id === appointmentId);
  const scheduleLocked = !!savedAppointment && hasAppointmentStarted(savedAppointment.start_datetime);

  const onOpenChange = (newValue: boolean) => formState.set({ isCreatingAppointment: newValue });

  return <Dialog open={formState.isCreatingAppointment} onOpenChange={onOpenChange}>
    <DialogContent className="flex max-h-[85vh] w-full flex-col overflow-hidden sm:max-w-xl">
      <CreateFormPresentation
        form={formState}
        set={setAppointmentField}
        setSelect={setAppointmentSelectField}
        onSubmit={onSubmit}
        onDateRangeChange={handleAppointmentDateRangeChange}
        options={options}
        patients={people?.patients ?? []}
        doctors={people?.doctors ?? []}
        otherAppointments={appointments.filter((a) => a.id !== appointmentId)}
        peopleLoading={people === null}
        error={error}
        isEditing={!!appointmentId}
        scheduleLocked={scheduleLocked}
      />
    </DialogContent>
  </Dialog>
}

export default CreateFormApplication
