import { type ChangeEvent, type SyntheticEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { getAppointments } from '@/lib/api/appointments';
import { type BillingOptions, createInvoice, updateInvoice } from '@/lib/api/billing';
import { receiverFromPatient } from '@/pages/billing/presentation/billing_functions';
import {
  EMPTY_ITEM,
  INITIAL_STATE,
} from '@/pages/billing/presentation/creationForm/creationForm_initialState';
import type {
  FormState,
  ItemFormState,
  TextField,
} from '@/pages/billing/presentation/creationForm/creationForm_types';
import CreationFormPresentation from '@/pages/billing/presentation/creationForm.presentation';
import type { Appointment } from '@/types/appointments_type';
import type { Patient } from '@/types/patients_type';

const CreationFormApplication = ({
  initialData,
  invoiceId,
  contentLocked = false,
  options,
  patients,
  patientsLoading,
  onClose,
  onSaved,
}: {
  initialData?: FormState;
  invoiceId?: string;
  contentLocked?: boolean;
  options: BillingOptions;
  patients: Patient[];
  patientsLoading: boolean;
  onClose?: () => void;
  onSaved?: () => void;
}) => {
  const [form, setForm] = useState<FormState>(initialData ?? INITIAL_STATE);
  const [open, setOpen] = useState(!!initialData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // null until the first load finishes
  const [appointments, setAppointments] = useState<Appointment[] | null>(null);

  // Appointments come from the database each time the form opens, to link the invoice to one
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    getAppointments()
      .then((a) => {
        if (!cancelled) setAppointments(a);
      })
      .catch(() => {
        // Linking an appointment is optional: the invoice can still be saved without them
        if (!cancelled) setAppointments([]);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const set = (key: TextField) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const setSelect = (key: TextField) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Choosing a patient fills the receiver with their data (still editable) and clears the appointment
  const setPatient = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    setForm((prev) => ({
      ...prev,
      patient_id: patientId,
      appointment_id: prev.patient_id === patientId ? prev.appointment_id : '',
      ...(patient && prev.patient_id !== patientId && receiverFromPatient(patient)),
    }));
  };

  const setItem = (index: number, key: keyof ItemFormState, value: string) =>
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    }));

  const addItem = () => setForm((prev) => ({ ...prev, items: [...prev.items, EMPTY_ITEM] }));

  const removeItem = (index: number) =>
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));

  const setVoided = (voided: boolean) => setForm((prev) => ({ ...prev, voided }));

  const onSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (invoiceId) {
        await updateInvoice(invoiceId, form);
      } else {
        await createInvoice(form);
      }
      setOpen(false);
      setForm(INITIAL_STATE);
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save invoice');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setForm(initialData ?? INITIAL_STATE);
          setError(null);
          onClose?.();
        }
      }}
    >
      <SheetTrigger asChild>
        <Button variant="outline">New Invoice</Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col overflow-hidden sm:max-w-xl md:max-w-2xl">
        <CreationFormPresentation
          form={form}
          isEditing={!!invoiceId}
          contentLocked={contentLocked}
          saving={saving}
          error={error}
          options={options}
          patients={patients}
          appointments={(appointments ?? []).filter((a) => a.patient_id === form.patient_id)}
          peopleLoading={patientsLoading || appointments === null}
          set={set}
          setSelect={setSelect}
          setPatient={setPatient}
          setItem={setItem}
          addItem={addItem}
          removeItem={removeItem}
          setVoided={setVoided}
          onSubmit={onSubmit}
        />
      </SheetContent>
    </Sheet>
  );
};

export default CreationFormApplication;
