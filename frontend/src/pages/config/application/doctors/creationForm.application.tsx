import { type ChangeEvent, type SyntheticEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { createDoctor, type DoctorOptions, updateDoctor } from '@/lib/api/doctors';
import { INITIAL_STATE } from '@/pages/config/presentation/doctors/creationForm/creationForm_initialState';
import type { FormState, TextField } from '@/pages/config/presentation/doctors/creationForm/creationForm_types';
import CreationFormPresentation from '@/pages/config/presentation/doctors/creationForm.presentation';
import type { WeekDay } from '@/types/doctors_type';

const CreationFormApplication = ({
  initialData,
  doctorId,
  options,
  onClose,
  onSaved,
}: {
  initialData?: FormState;
  doctorId?: string;
  options: DoctorOptions;
  onClose?: () => void;
  onSaved?: () => void;
}) => {
  const [form, setForm] = useState<FormState>(initialData ?? INITIAL_STATE);
  const [open, setOpen] = useState(!!initialData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: TextField) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const setSelect = (key: TextField) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const setSchedule = (day: WeekDay, hours: number[]) =>
    setForm((prev) => ({ ...prev, schedule: { ...prev.schedule, [day]: hours } }));

  const onSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (doctorId) {
        await updateDoctor(doctorId, form);
      } else {
        await createDoctor(form);
      }
      setOpen(false);
      setForm(INITIAL_STATE);
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save doctor');
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
        <Button variant="outline">Register Doctor</Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col overflow-hidden sm:max-w-xl md:max-w-2xl">
        <CreationFormPresentation
          form={form}
          isEditing={!!doctorId}
          saving={saving}
          error={error}
          set={set}
          setSelect={setSelect}
          setSchedule={setSchedule}
          onSubmit={onSubmit}
          options={options}
        />
      </SheetContent>
    </Sheet>
  );
};

export default CreationFormApplication;
