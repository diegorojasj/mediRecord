import { Button } from '@/components/ui/button';
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldGroup, FieldSet, FieldLegend, FieldSeparator } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SelectField } from '@/components/selectField';
import { type ChangeEvent, type SyntheticEvent } from 'react';
import type { FormState } from './appointmentForm/appointmentForm_types';

type SelectOption = { value: string; label: string };
type FormOptions = {
  type: SelectOption[];
  status: SelectOption[];
  cancelledBy: SelectOption[];
};

const splitDateTime = (value: string) => {
  const [date = '', time = ''] = value.split('T');
  return { date, time: time.slice(0, 5) };
};

const combineDateTime = (date: string, time: string) => `${date}T${time || '00:00'}`;

const todayDateString = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const currentTimeString = () => {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
};

const AppointmentFormPresentation = ({
  form,
  set,
  setSelect,
  onSubmit,
  onDateRangeChange,
  options,
}: {
  form: FormState;
  options: FormOptions;
  set: (key: keyof FormState) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  setSelect: (key: keyof FormState) => (value: string) => void;
  onSubmit: (e: SyntheticEvent<HTMLFormElement>) => void;
  onDateRangeChange?: (startDate: string, endDate: string) => void;
}) => {
  const startParts = splitDateTime(form.start_datetime);
  const endParts = splitDateTime(form.end_datetime);
  const todayDate = todayDateString();
  const currentTime = currentTimeString();
  const minEndDate = startParts.date > todayDate ? startParts.date : todayDate;
  const minStartTime = startParts.date === todayDate ? currentTime : undefined;
  const minEndTime = endParts.date === todayDate ? currentTime : undefined;

  const setDateTimePart =
    (key: 'start_datetime' | 'end_datetime', part: 'date' | 'time') =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const parts = key === 'start_datetime' ? startParts : endParts;

      const next =
        part === 'date'
          ? combineDateTime(e.target.value, parts.time)
          : combineDateTime(parts.date, e.target.value);

      set(key)({ target: { value: next } } as ChangeEvent<HTMLInputElement>);

      const startPushesEnd =
        key === 'start_datetime' && part === 'date' && e.target.value > endParts.date;
      if (startPushesEnd) {
        set('end_datetime')({
          target: { value: combineDateTime(e.target.value, endParts.time) },
        } as ChangeEvent<HTMLInputElement>);
      }

      if (part === 'date' && onDateRangeChange) {
        const nextStartDate = key === 'start_datetime' ? e.target.value : startParts.date;
        const nextEndDate = startPushesEnd
          ? e.target.value
          : key === 'end_datetime'
            ? e.target.value
            : endParts.date;
        onDateRangeChange(nextStartDate, nextEndDate);
      }
    };

  return (
    <form onSubmit={onSubmit} className="flex h-full flex-col">
      <DialogHeader>
        <DialogTitle className="!text-gray-900 dark:!text-gray-50">
          Register Appointment
        </DialogTitle>
        <DialogDescription>Fill in the appointment details below.</DialogDescription>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-6 px-6 py-6">
          {/* Patient & Provider */}
          <FieldSet>
            <FieldLegend>Patient & Provider</FieldLegend>
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <Label htmlFor="patient_id">Patient ID *</Label>
                  <Input
                    id="patient_id"
                    value={form.patient_id}
                    onChange={set('patient_id')}
                    required
                  />
                </Field>
                <Field>
                  <Label htmlFor="doctor_id">Doctor ID *</Label>
                  <Input
                    id="doctor_id"
                    value={form.doctor_id}
                    onChange={set('doctor_id')}
                    required
                  />
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>

          <FieldSeparator />

          {/* Schedule */}
          <FieldSet>
            <FieldLegend>Schedule</FieldLegend>
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <Label htmlFor="start_date">Start *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="start_date"
                      type="date"
                      min={todayDate}
                      value={startParts.date}
                      onChange={setDateTimePart('start_datetime', 'date')}
                      required
                    />
                    <Input
                      id="start_time"
                      type="time"
                      min={minStartTime}
                      value={startParts.time}
                      onChange={setDateTimePart('start_datetime', 'time')}
                      required
                    />
                  </div>
                </Field>
                <Field>
                  <Label htmlFor="end_date">End *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="end_date"
                      type="date"
                      min={minEndDate}
                      value={endParts.date}
                      onChange={setDateTimePart('end_datetime', 'date')}
                      required
                    />
                    <Input
                      id="end_time"
                      type="time"
                      min={minEndTime}
                      value={endParts.time}
                      onChange={setDateTimePart('end_datetime', 'time')}
                      required
                    />
                  </div>
                </Field>
              </div>
              <Field>
                <Label htmlFor="duration_minutes">Duration (minutes) *</Label>
                <Input
                  id="duration_minutes"
                  type="number"
                  min={0}
                  value={form.duration_minutes}
                  onChange={set('duration_minutes')}
                  required
                />
              </Field>
            </FieldGroup>
          </FieldSet>

          <FieldSeparator />

          {/* Details */}
          <FieldSet>
            <FieldLegend>Details</FieldLegend>
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SelectField
                  id="type"
                  label="Type *"
                  options={options.type}
                  value={form.type}
                  onChange={setSelect('type')}
                />
                <SelectField
                  id="status"
                  label="Status"
                  options={options.status}
                  value={form.status}
                  onChange={setSelect('status')}
                />
              </div>
              <Field>
                <Label htmlFor="reason">Reason</Label>
                <Input id="reason" value={form.reason} onChange={set('reason')} />
              </Field>
              <Field>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" rows={3} value={form.notes} onChange={set('notes')} />
              </Field>
            </FieldGroup>
          </FieldSet>

          {form.status === 'cancelled' && (
            <>
              <FieldSeparator />

              {/* Cancellation */}
              <FieldSet>
                <FieldLegend>Cancellation</FieldLegend>
                <FieldGroup>
                  <SelectField
                    id="cancelled_by"
                    label="Cancelled By"
                    options={options.cancelledBy}
                    value={form.cancelled_by}
                    onChange={setSelect('cancelled_by')}
                  />
                  <Field>
                    <Label htmlFor="cancellation_reason">Cancellation Reason</Label>
                    <Textarea
                      id="cancellation_reason"
                      rows={3}
                      value={form.cancellation_reason}
                      onChange={set('cancellation_reason')}
                    />
                  </Field>
                </FieldGroup>
              </FieldSet>
            </>
          )}
        </div>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline" type="button">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit">Register</Button>
      </DialogFooter>
    </form>
  );
};

export default AppointmentFormPresentation;
