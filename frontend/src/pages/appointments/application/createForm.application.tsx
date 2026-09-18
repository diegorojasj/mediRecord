import type { ChangeEvent, SyntheticEvent } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { AppointmentOptions } from '@/lib/api/appointments';
import CreateFormPresentation from '@/pages/appointments/presentation/appointmentForm.presentation';
import type { FormState, SelectDateRangeType } from '@/pages/appointments/presentation/createForm/createForm_types';
import { useFormState } from '../presentation/createForm/createForm_data';


const CreateFormApplication = ({ options, selectDateRange }: { options: AppointmentOptions, selectDateRange: SelectDateRangeType }) => {
  const formState = useFormState()

  const parseDateOnly = (value: string) => {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const handleAppointmentDateRangeChange = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return;
    selectDateRange(parseDateOnly(startDate), parseDateOnly(endDate), { updateCurrentDate: true });
  };

  const setAppointmentField =
    (key: keyof FormState) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      formState.set({ ...formState, [key]: e.target.value });

  const setAppointmentSelectField = (key: keyof FormState) => (value: string) =>
    formState.set({ ...formState, [key]: value });

  const handleAppointmentFormSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    formState.set({ isCreatingAppointment: false });
  };

  const onOpenChange = (newValue: boolean) => formState.set({ isCreatingAppointment: newValue });

  return <Dialog open={formState.isCreatingAppointment} onOpenChange={onOpenChange}>
    <DialogContent className="flex max-h-[85vh] w-full flex-col overflow-hidden sm:max-w-xl">
      <CreateFormPresentation
        form={formState}
        set={setAppointmentField}
        setSelect={setAppointmentSelectField}
        onSubmit={handleAppointmentFormSubmit}
        onDateRangeChange={handleAppointmentDateRangeChange}
        options={options}
      />
    </DialogContent>
  </Dialog>
}

export default CreateFormApplication
