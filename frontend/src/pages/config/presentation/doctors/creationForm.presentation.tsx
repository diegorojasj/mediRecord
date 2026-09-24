import type { ChangeEvent, SyntheticEvent } from 'react';
import { SelectField } from '@/components/selectField';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLegend, FieldSeparator, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  SheetClose,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { DoctorOptions } from '@/lib/api/doctors';
import type { WeekDay } from '@/types/doctors_type';
import type { FormState, TextField } from './creationForm/creationForm_types';
import ScheduleEditor from './creationForm/scheduleEditor';

const CreationFormPresentation = ({
  form,
  isEditing,
  saving,
  error,
  set,
  setSelect,
  setSchedule,
  onSubmit,
  options,
}: {
  form: FormState;
  isEditing: boolean;
  saving: boolean;
  error: string | null;
  options: DoctorOptions;
  set: (key: TextField) => (e: ChangeEvent<HTMLInputElement>) => void;
  setSelect: (key: TextField) => (value: string) => void;
  setSchedule: (day: WeekDay, hours: number[]) => void;
  onSubmit: (e: SyntheticEvent<HTMLFormElement>) => void;
}) => {
  return (
    <form onSubmit={onSubmit} className="flex h-full flex-col">
      <SheetHeader>
        <SheetTitle className="!text-gray-900 dark:!text-gray-50">
          {isEditing ? 'Edit Doctor' : 'Register Doctor'}
        </SheetTitle>
        <SheetDescription>Fill in the doctor details below.</SheetDescription>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-6 px-6 py-6">
          {/* Identification */}
          <FieldSet>
            <FieldLegend>Identification</FieldLegend>
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={form.first_name}
                    onChange={set('first_name')}
                    required
                  />
                </Field>
                <Field>
                  <Label htmlFor="first_surname">First Surname *</Label>
                  <Input
                    id="first_surname"
                    value={form.first_surname}
                    onChange={set('first_surname')}
                    required
                  />
                </Field>
                <Field>
                  <Label htmlFor="second_surname">Second Surname</Label>
                  <Input
                    id="second_surname"
                    value={form.second_surname}
                    onChange={set('second_surname')}
                  />
                </Field>
                <Field>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={set('phone')}
                    required
                  />
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>

          <FieldSeparator />

          {/* Professional */}
          <FieldSet>
            <FieldLegend>Professional</FieldLegend>
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <Label htmlFor="professional_registration_number">Registration Number *</Label>
                  <Input
                    id="professional_registration_number"
                    value={form.professional_registration_number}
                    onChange={set('professional_registration_number')}
                    required
                  />
                </Field>
                <SelectField
                  id="specialty"
                  label="Specialty *"
                  options={options.specialty}
                  value={form.specialty}
                  onChange={setSelect('specialty')}
                />
                <SelectField
                  id="status"
                  label="Status"
                  options={options.status}
                  value={form.status}
                  onChange={setSelect('status')}
                />
              </div>
            </FieldGroup>
          </FieldSet>

          <FieldSeparator />

          {/* Schedule */}
          <FieldSet>
            <FieldLegend>Working Hours</FieldLegend>
            <FieldGroup>
              <ScheduleEditor
                schedule={form.schedule}
                weekDays={options.weekDays}
                onChange={setSchedule}
              />
            </FieldGroup>
          </FieldSet>
        </div>
      </div>

      <SheetFooter>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <SheetClose asChild>
          <Button variant="outline" type="button">
            Cancel
          </Button>
        </SheetClose>
        <Button type="submit" disabled={saving || !form.specialty}>
          {saving ? 'Saving…' : isEditing ? 'Save' : 'Register'}
        </Button>
      </SheetFooter>
    </form>
  );
};

export default CreationFormPresentation;
