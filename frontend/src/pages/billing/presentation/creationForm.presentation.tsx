import type { ChangeEvent, SyntheticEvent } from 'react';
import { SearchSelectField } from '@/components/searchSelectField';
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
import { Textarea } from '@/components/ui/textarea';
import type { BillingOptions } from '@/lib/api/billing';
import { cn } from '@/lib/utils';
import type { Appointment } from '@/types/appointments_type';
import type { Patient } from '@/types/patients_type';
import { appointmentOption, formatMoney, formTotals, patientOption } from './billing_functions';
import ItemsEditor from './creationForm/itemsEditor';
import type { FormState, ItemFormState, TextField } from './creationForm/creationForm_types';

const NO_APPOINTMENT = { value: '', label: 'No linked appointment' };

function TotalRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={cn(
          'text-xs',
          strong ? 'font-semibold text-foreground' : 'text-muted-foreground',
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          'text-xs tabular-nums',
          strong ? 'font-semibold text-foreground' : 'text-foreground',
        )}
      >
        {value}
      </span>
    </div>
  );
}

const CreationFormPresentation = ({
  form,
  isEditing,
  contentLocked,
  saving,
  error,
  options,
  patients,
  appointments,
  peopleLoading,
  set,
  setSelect,
  setPatient,
  setItem,
  addItem,
  removeItem,
  setVoided,
  onSubmit,
}: {
  form: FormState;
  isEditing: boolean;
  // The invoice was validated by SIN: only payment data can change
  contentLocked: boolean;
  saving: boolean;
  error: string | null;
  options: BillingOptions;
  patients: Patient[];
  appointments: Appointment[];
  peopleLoading: boolean;
  set: (key: TextField) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  setSelect: (key: TextField) => (value: string) => void;
  setPatient: (patientId: string) => void;
  setItem: (index: number, key: keyof ItemFormState, value: string) => void;
  addItem: () => void;
  removeItem: (index: number) => void;
  setVoided: (voided: boolean) => void;
  onSubmit: (e: SyntheticEvent<HTMLFormElement>) => void;
}) => {
  const totals = formTotals(form);
  const needsDocumentNumber = form.receiver_document_type !== 'no_name';
  const invalidAmounts = !form.voided && (totals.discountTooHigh || totals.overpaid);

  return (
    <form onSubmit={onSubmit} className="flex h-full flex-col">
      <SheetHeader>
        <SheetTitle className="!text-gray-900 dark:!text-gray-50">
          {isEditing ? 'Edit Invoice' : 'New Invoice'}
        </SheetTitle>
        <SheetDescription>
          {contentLocked
            ? 'This invoice was validated by SIN: only payment details can be changed.'
            : 'Fill in the invoice details below. Totals are calculated automatically.'}
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-6 px-6 py-6">
          {/* Patient */}
          <FieldSet disabled={contentLocked}>
            <FieldLegend>Patient</FieldLegend>
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SearchSelectField
                  id="patient_id"
                  label="Patient *"
                  placeholder="Search patient"
                  emptyMessage="No patients found"
                  loading={peopleLoading}
                  options={patients.map(patientOption)}
                  value={form.patient_id}
                  onChange={setPatient}
                />
                <SearchSelectField
                  id="appointment_id"
                  label="Appointment"
                  placeholder={form.patient_id ? 'Link an appointment' : 'Select a patient first'}
                  emptyMessage="This patient has no appointments"
                  loading={peopleLoading}
                  options={
                    form.patient_id ? [NO_APPOINTMENT, ...appointments.map(appointmentOption)] : []
                  }
                  value={form.appointment_id}
                  onChange={setSelect('appointment_id')}
                />
              </div>
            </FieldGroup>
          </FieldSet>

          <FieldSeparator />

          {/* Receiver */}
          <FieldSet disabled={contentLocked}>
            <FieldLegend>Receiver</FieldLegend>
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field className="sm:col-span-2">
                  <Label htmlFor="receiver_name">Name / Business name *</Label>
                  <Input
                    id="receiver_name"
                    value={form.receiver_name}
                    onChange={set('receiver_name')}
                    required
                  />
                </Field>
                <SelectField
                  id="receiver_document_type"
                  label="Document type *"
                  options={options.receiverDocumentType}
                  value={form.receiver_document_type}
                  onChange={setSelect('receiver_document_type')}
                />
                {needsDocumentNumber && (
                  <Field>
                    <Label htmlFor="receiver_document_number">
                      {form.receiver_document_type} number *
                    </Label>
                    <Input
                      id="receiver_document_number"
                      value={form.receiver_document_number}
                      onChange={set('receiver_document_number')}
                      required
                    />
                  </Field>
                )}
              </div>
            </FieldGroup>
          </FieldSet>

          <FieldSeparator />

          {/* Items */}
          <FieldSet disabled={contentLocked}>
            <FieldLegend>Items</FieldLegend>
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SelectField
                  id="currency"
                  label="Currency *"
                  options={options.currency}
                  value={form.currency}
                  onChange={setSelect('currency')}
                />
              </div>
              <ItemsEditor
                items={form.items}
                currency={form.currency}
                disabled={contentLocked}
                onChange={setItem}
                onAdd={addItem}
                onRemove={removeItem}
              />
            </FieldGroup>
          </FieldSet>

          <FieldSeparator />

          {/* Payment */}
          <FieldSet>
            <FieldLegend>Payment</FieldLegend>
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field>
                  <Label htmlFor="discount">Discount</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.discount}
                    onChange={set('discount')}
                    disabled={contentLocked}
                    aria-invalid={totals.discountTooHigh || undefined}
                  />
                </Field>
                <SelectField
                  id="payment_method"
                  label="Payment method *"
                  options={options.paymentMethod}
                  value={form.payment_method}
                  onChange={setSelect('payment_method')}
                />
                <Field>
                  <Label htmlFor="amount_paid">Amount paid</Label>
                  <Input
                    id="amount_paid"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount_paid}
                    onChange={set('amount_paid')}
                    aria-invalid={totals.overpaid || undefined}
                  />
                </Field>
              </div>

              <div className="space-y-1 rounded-md bg-muted/50 p-3">
                <TotalRow label="Subtotal" value={formatMoney(totals.subtotal, form.currency)} />
                <TotalRow
                  label="Discount"
                  value={`- ${formatMoney(form.discount || 0, form.currency)}`}
                />
                <TotalRow label="Total" value={formatMoney(totals.total, form.currency)} strong />
                <TotalRow label="Balance due" value={formatMoney(totals.balance, form.currency)} />
                {totals.discountTooHigh && (
                  <p className="text-[11px] text-destructive">
                    The discount can't exceed the subtotal.
                  </p>
                )}
                {totals.overpaid && (
                  <p className="text-[11px] text-destructive">
                    The amount paid can't exceed the total.
                  </p>
                )}
              </div>
            </FieldGroup>
          </FieldSet>

          <FieldSeparator />

          {/* SIN */}
          <FieldSet>
            <FieldLegend>Tax authority (SIN)</FieldLegend>
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SelectField
                  id="sin_status"
                  label="SIN status"
                  // "voided" is set by voiding the invoice, not picked by hand
                  options={options.sinStatus.filter((o) => o.value !== 'voided')}
                  value={form.sin_status}
                  onChange={setSelect('sin_status')}
                />
                <Field>
                  <Label htmlFor="cuf">CUF</Label>
                  <Input id="cuf" value={form.cuf} onChange={set('cuf')} />
                </Field>
              </div>
              <Field>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" value={form.notes} onChange={set('notes')} />
              </Field>
            </FieldGroup>
          </FieldSet>

          {/* Void: only for existing invoices, they are never deleted once paid or sent to SIN */}
          {isEditing && (
            <>
              <FieldSeparator />
              <FieldSet>
                <FieldLegend>Void invoice</FieldLegend>
                <FieldGroup>
                  <p className="text-xs text-muted-foreground">
                    A voided invoice stays in the records but can no longer be modified.
                  </p>
                  {form.voided ? (
                    <>
                      <Field>
                        <Label htmlFor="void_reason">Void reason *</Label>
                        <Textarea
                          id="void_reason"
                          value={form.void_reason}
                          onChange={set('void_reason')}
                          required
                        />
                      </Field>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="self-start"
                        onClick={() => setVoided(false)}
                      >
                        Keep invoice active
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="self-start"
                      onClick={() => setVoided(true)}
                    >
                      Void this invoice
                    </Button>
                  )}
                </FieldGroup>
              </FieldSet>
            </>
          )}
        </div>
      </div>

      <SheetFooter>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <SheetClose asChild>
          <Button variant="outline" type="button">
            Cancel
          </Button>
        </SheetClose>
        <Button
          type="submit"
          variant={form.voided ? 'destructive' : 'default'}
          disabled={saving || !form.patient_id || invalidAmounts}
        >
          {saving ? 'Saving…' : form.voided ? 'Void invoice' : isEditing ? 'Save' : 'Create'}
        </Button>
      </SheetFooter>
    </form>
  );
};

export default CreationFormPresentation;
