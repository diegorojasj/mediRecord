import { SearchSelectField } from '@/components/searchSelectField';
import { SelectField } from '@/components/selectField';
import { Button } from '@/components/ui/button';
import {
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Field, FieldGroup, FieldLegend, FieldSeparator, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { AppointmentOptions } from '@/lib/api/appointments';
import type { Appointment } from '@/types/appointments_type';
import type { Doctor, WeekDay } from '@/types/doctors_type';
import type { Patient } from '@/types/patients_type';
import type { ChangeEvent, SyntheticEvent } from 'react';
import { cn } from '@/lib/utils';
import {
  addDaysToDate,
  DAY_END_MINUTES,
  doctorBookingsOn,
  doctorConflict,
  doctorHoursOn,
  doctorOption,
  firstAvailableStart,
  hourRanges,
  type MinuteRange,
  minutesBetween,
  minutesToTime,
  patientOption,
  scheduleWarning,
  timeToMinutes,
  weekDayOf,
  workingWeekDays,
} from './creationForm/creationForm_functions';
import type { FormState } from './creationForm/creationForm_types';

const splitDateTime = (value: string) => {
  const [date = '', time = ''] = value.split('T');
  return { date, time: time.slice(0, 5) };
};

const combineDateTime = (date: string, time: string) => `${date}T${time || '00:00'}`;

const DURATION_PRESETS = [15, 30, 45, 60, 90];
const DEFAULT_DURATION = 30;
// How far ahead a new appointment looks for the doctor's next free slot
const SEARCH_AHEAD_DAYS = 14;

const formatHour = (hour: number) => `${String(hour).padStart(2, '0')}:00`;

const minutesOfDate = (value: string) => {
  const date = new Date(value);
  return date.getHours() * 60 + date.getMinutes();
};

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

const CreateFormPresentation = ({
  form,
  set,
  setSelect,
  onSubmit,
  onDateRangeChange,
  options,
  patients,
  doctors,
  otherAppointments,
  peopleLoading,
  error,
  isEditing,
}: {
  isEditing: boolean;
  // Every appointment except the one being edited, to keep the doctor from being double-booked
  otherAppointments: Appointment[];
  form: FormState;
  options: AppointmentOptions;
  patients: Patient[];
  doctors: Doctor[];
  peopleLoading: boolean;
  error: string | null;
  set: (key: keyof FormState) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  setSelect: (key: keyof FormState) => (value: string) => void;
  onSubmit: (e: SyntheticEvent<HTMLFormElement>) => void;
  onDateRangeChange?: (startDate: string, endDate: string) => void;
}) => {
  // An appointment lives on a single day: one date, a start time and an end time
  const { date, time: startTime } = splitDateTime(form.start_datetime);
  const { time: endTime } = splitDateTime(form.end_datetime);
  const todayDate = todayDateString();
  // New appointments can't be in the past; existing ones may be (e.g. marking one as completed)
  const minDate = isEditing ? undefined : todayDate;
  const minStartTime = !isEditing && date === todayDate ? currentTimeString() : undefined;
  const startMinutes = timeToMinutes(startTime);

  // Only active records can be booked; keep the current one visible when editing
  const patientOptions = patients
    .filter((p) => p.is_active || p.id === form.patient_id)
    .map(patientOption);
  const doctorOptions = doctors
    .filter((d) => d.status === 'active' || d.id === form.doctor_id)
    .map(doctorOption);
  const selectedDoctor = doctors.find((d) => d.id === form.doctor_id);
  const duration = minutesBetween(form.start_datetime, form.end_datetime);
  const invalidRange = duration !== null && duration <= 0;
  const doctorWarning = scheduleWarning(selectedDoctor, form.start_datetime, form.end_datetime);
  const weekDay = weekDayOf(date);
  const doctorRanges = hourRanges(doctorHoursOn(selectedDoctor, weekDay));
  const appointmentLength = duration && duration > 0 ? duration : DEFAULT_DURATION;
  const bookingsOn = (day: string, doctorId = form.doctor_id) =>
    doctorBookingsOn(otherAppointments, doctorId, day);
  const conflict = doctorConflict(otherAppointments, form);
  const canSubmit =
    !!form.patient_id && !!form.doctor_id && !!form.type && !!duration && !invalidRange && !conflict;

  const setValue = (key: 'start_datetime' | 'end_datetime', value: string) =>
    set(key)({ target: { value } } as ChangeEvent<HTMLInputElement>);

  // New appointments can't start before now
  const earliestMinutes = (day: string) =>
    !isEditing && day === todayDate ? (timeToMinutes(currentTimeString()) ?? 0) : 0;

  // Moves the appointment, keeping its length, to the doctor's first free slot at or after
  // fromMinutes on that day. With searchAhead, a day with no room (the doctor doesn't work,
  // or today's hours are over) moves on to the next days. Returns false when nothing was found
  const moveToFirstSlot = (
    doctor: Doctor | undefined,
    day: string,
    fromMinutes = 0,
    { searchAhead = false } = {},
  ) => {
    const daysToCheck = searchAhead ? SEARCH_AHEAD_DAYS : 1;
    for (let offset = 0; offset < daysToCheck; offset++) {
      const candidate = addDaysToDate(day, offset);
      const start = firstAvailableStart(
        doctorHoursOn(doctor, weekDayOf(candidate)),
        appointmentLength,
        Math.max(offset === 0 ? fromMinutes : 0, earliestMinutes(candidate)),
        bookingsOn(candidate, doctor?.id),
      );
      if (start === null) continue;

      setValue('start_datetime', combineDateTime(candidate, minutesToTime(start)));
      setValue('end_datetime', combineDateTime(candidate, minutesToTime(start + appointmentLength)));
      // The calendar follows the appointment when it moves to another day
      if (candidate !== day) onDateRangeChange?.(candidate, candidate);
      return true;
    }
    return false;
  };

  // A new appointment starts at the chosen doctor's first free working hour
  const onDoctorChange = (doctorId: string) => {
    setSelect('doctor_id')(doctorId);
    if (isEditing || !date) return;
    moveToFirstSlot(doctors.find((d) => d.id === doctorId), date, 0, { searchAhead: true });
  };

  // Moving the date moves the whole appointment; the calendar follows that single day
  const onDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextDate = e.target.value;
    const nextStart = combineDateTime(nextDate, startTime);
    const nextEnd = combineDateTime(nextDate, endTime);
    setValue('start_datetime', nextStart);
    setValue('end_datetime', nextEnd);
    // Keep the chosen time when the doctor is free then; otherwise jump to their first free slot
    const busy =
      scheduleWarning(selectedDoctor, nextStart, nextEnd) ||
      doctorConflict(otherAppointments, { ...form, start_datetime: nextStart, end_datetime: nextEnd });
    if (!isEditing && nextDate && busy) {
      moveToFirstSlot(selectedDoctor, nextDate);
    }
    if (nextDate) onDateRangeChange?.(nextDate, nextDate);
  };

  // Moving the start keeps the current length, without crossing midnight
  const onStartTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextStart = e.target.value;
    setValue('start_datetime', combineDateTime(date, nextStart));
    const nextStartMinutes = timeToMinutes(nextStart);
    if (nextStartMinutes !== null && duration && duration > 0) {
      setValue('end_datetime', combineDateTime(date, minutesToTime(nextStartMinutes + duration)));
    }
  };

  const onEndTimeChange = (e: ChangeEvent<HTMLInputElement>) =>
    setValue('end_datetime', combineDateTime(date, e.target.value));

  const applyDuration = (minutes: number) => {
    if (startMinutes === null) return;
    setValue('end_datetime', combineDateTime(date, minutesToTime(startMinutes + minutes)));
  };

  return (
    <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
      <DialogHeader>
        <DialogTitle className="!text-gray-900 dark:!text-gray-50">
          {isEditing ? 'Edit Appointment' : 'Register Appointment'}
        </DialogTitle>
        <DialogDescription>Fill in the appointment details below.</DialogDescription>
      </DialogHeader>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-6 px-6 py-6">
          {/* Patient & Provider */}
          <FieldSet>
            <FieldLegend>Patient & Provider</FieldLegend>
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SearchSelectField
                  id="patient_id"
                  label="Patient *"
                  placeholder="Search patient"
                  emptyMessage="No patients found"
                  loading={peopleLoading}
                  options={patientOptions}
                  value={form.patient_id}
                  onChange={setSelect('patient_id')}
                />
                <SearchSelectField
                  id="doctor_id"
                  label="Doctor *"
                  placeholder="Search doctor"
                  emptyMessage="No active doctors found"
                  loading={peopleLoading}
                  options={doctorOptions}
                  value={form.doctor_id}
                  onChange={onDoctorChange}
                />
              </div>
            </FieldGroup>
          </FieldSet>

          <FieldSeparator />

          {/* Schedule */}
          <FieldSet>
            <FieldLegend>Schedule</FieldLegend>
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field>
                  <Label htmlFor="appointment_date">Date *</Label>
                  <Input
                    id="appointment_date"
                    type="date"
                    min={minDate}
                    value={date}
                    onChange={onDateChange}
                    required
                  />
                </Field>
                <Field>
                  <Label htmlFor="start_time">Start *</Label>
                  <Input
                    id="start_time"
                    type="time"
                    step={300}
                    min={minStartTime}
                    value={startTime}
                    onChange={onStartTimeChange}
                    required
                  />
                </Field>
                <Field>
                  <Label htmlFor="end_time">End *</Label>
                  <Input
                    id="end_time"
                    type="time"
                    step={300}
                    min={startTime || undefined}
                    value={endTime}
                    onChange={onEndTimeChange}
                    required
                  />
                </Field>
              </div>
              <DoctorHours
                doctor={selectedDoctor}
                weekDay={weekDay}
                ranges={doctorRanges}
                startMinutes={startMinutes}
                bookings={bookingsOn(date)}
                canMoveTo={(range) => {
                  const start = firstAvailableStart(
                    doctorHoursOn(selectedDoctor, weekDay),
                    appointmentLength,
                    Math.max(range.start * 60, earliestMinutes(date)),
                    bookingsOn(date),
                  );
                  return start !== null && start < range.end * 60;
                }}
                onMoveTo={(range) => moveToFirstSlot(selectedDoctor, date, range.start * 60)}
              />
              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-muted-foreground">
                    Duration:{' '}
                    <span className="font-medium text-foreground">
                      {duration && duration > 0 ? `${duration} min` : '—'}
                    </span>
                  </span>
                  {DURATION_PRESETS.map((minutes) => (
                    <button
                      key={minutes}
                      type="button"
                      disabled={startMinutes === null || startMinutes + minutes > DAY_END_MINUTES}
                      onClick={() => applyDuration(minutes)}
                      className={cn(
                        'rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-40',
                        duration === minutes
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground',
                      )}
                    >
                      {minutes < 60 ? `${minutes}m` : `${minutes / 60}h`.replace('.5h', 'h30')}
                    </button>
                  ))}
                </div>
                {invalidRange && (
                  <p className="text-destructive">The end must be after the start.</p>
                )}
                {!invalidRange && conflict && (
                  <p className="text-destructive">
                    This doctor already has an appointment from{' '}
                    {minutesToTime(minutesOfDate(conflict.start_datetime))} to{' '}
                    {minutesToTime(minutesOfDate(conflict.end_datetime))}. Pick another time.
                  </p>
                )}
                {!invalidRange && !conflict && doctorWarning && (
                  <p className="text-amber-600 dark:text-amber-400">{doctorWarning}</p>
                )}
              </div>
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
                  options={options.appointmentType}
                  value={form.type}
                  onChange={setSelect('type')}
                />
                <SelectField
                  id="status"
                  label="Status"
                  options={options.appointmentStatus}
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
        <div className='flex items-center justify-end gap-3 px-6 pb-2' >
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button type="submit" disabled={!canSubmit}>{isEditing ? 'Save' : 'Register'}</Button>
        </div>
      </div>
    </form>
  );
};

type HourRange = { start: number; end: number };

// The selected doctor's working hours on the appointment's day; each range jumps to its first free slot
const DoctorHours = ({
  doctor,
  weekDay,
  ranges,
  startMinutes,
  bookings,
  canMoveTo,
  onMoveTo,
}: {
  doctor: Doctor | undefined;
  weekDay: WeekDay | null;
  ranges: HourRange[];
  startMinutes: number | null;
  bookings: MinuteRange[];
  canMoveTo: (range: HourRange) => boolean;
  onMoveTo: (range: HourRange) => void;
}) => {
  if (!doctor) {
    return (
      <p className="text-xs text-muted-foreground">Select a doctor to see their working hours.</p>
    );
  }

  if (!weekDay) return null;

  if (ranges.length === 0) {
    const workingDays = workingWeekDays(doctor);
    return (
      <p className="rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        This doctor doesn’t work on {weekDay}.{' '}
        {workingDays.length > 0
          ? `Working days: ${workingDays.join(', ')}.`
          : 'No working hours have been set.'}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 rounded-md border bg-muted/30 px-3 py-2 text-xs">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-muted-foreground">Working hours on {weekDay}:</span>
        {ranges.map((range) => {
          const active =
            startMinutes !== null &&
            startMinutes >= range.start * 60 &&
            startMinutes < range.end * 60;
          const available = canMoveTo(range);
          return (
            <button
              key={range.start}
              type="button"
              disabled={!available}
              title={available ? 'Move the appointment to the first free time' : 'No time left in this range'}
              onClick={() => onMoveTo(range)}
              className={cn(
                'rounded-full border px-2 py-0.5 text-[11px] font-medium tabular-nums transition-colors disabled:pointer-events-none disabled:opacity-40',
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-foreground hover:bg-muted',
              )}
            >
              {formatHour(range.start)}–{formatHour(range.end)}
            </button>
          );
        })}
      </div>
      <p className="text-muted-foreground">
        {bookings.length > 0 ? 'Already booked: ' : 'No appointments booked yet this day.'}
        {bookings
          .map((b) => `${minutesToTime(b.start)}–${minutesToTime(b.end)}`)
          .join(', ')}
      </p>
    </div>
  );
};

export default CreateFormPresentation;
