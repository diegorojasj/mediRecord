import { format } from 'date-fns';
import type { SearchSelectOption } from '@/components/searchSelectField';
import type { SelectOption } from '@/lib/utils';
import type { Appointment } from '@/types/appointments_type';
import type { Invoice } from '@/types/billing_type';
import type { Patient } from '@/types/patients_type';
import type { FormState, ItemFormState } from './creationForm/creationForm_types';

const joinName = (...parts: (string | null | undefined)[]) => parts.filter(Boolean).join(' ');

const humanize = (value: string) => {
  const text = value.replaceAll('_', ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export function labelFor(options: SelectOption<string>[], value: string) {
  return options.find((o) => o.value === value)?.label ?? value;
}

export function patientName(p: Patient) {
  return joinName(p.first_name, p.first_surname, p.second_surname);
}

export function patientOption(p: Patient): SearchSelectOption {
  return {
    value: p.id,
    label: patientName(p),
    description: `${p.record_number} · CI ${p.national_id}`,
    keywords: p.tax_id,
  };
}

// Receiver printed on the invoice: the patient's NIT when they have one, otherwise their CI
export function receiverFromPatient(p: Patient) {
  return {
    receiver_name: patientName(p),
    receiver_document_type: p.tax_id ? 'NIT' : 'CI',
    receiver_document_number: p.tax_id || p.national_id,
  };
}

// Dates the backend stores in UTC may come back without an offset: read them as UTC
export function parseApiDate(value: string) {
  return new Date(/[zZ]|[+-]\d{2}:\d{2}$/.test(value) ? value : `${value}Z`);
}

export const formatDate = (value?: string | null) =>
  value ? format(parseApiDate(value), 'dd/MM/yyyy') : undefined;

export const formatDateTime = (value?: string | null) =>
  value ? format(parseApiDate(value), 'dd/MM/yyyy HH:mm') : undefined;

export function appointmentOption(a: Appointment): SearchSelectOption {
  // Appointment times are stored as clinic local time, shown as they are
  return {
    value: a.id,
    label: format(new Date(a.start_datetime), 'dd/MM/yyyy HH:mm'),
    description: joinName(humanize(a.type), a.reason && `· ${a.reason}`),
  };
}

// Money is handled in cents so previews match the backend's 2-decimal rounding
const toCents = (value: string | number) => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
};

export function formatMoney(value: string | number, currency: string) {
  const amount = toCents(value) / 100;
  return `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function itemSubtotal(item: ItemFormState) {
  return Math.round(Number(item.quantity || 0) * toCents(item.unit_price || 0)) / 100;
}

// Same rules as the billing service: subtotal from the items, total = subtotal - discount
export function formTotals(form: FormState) {
  const subtotalCents = form.items.reduce((sum, item) => sum + toCents(itemSubtotal(item)), 0);
  const discountCents = toCents(form.discount || 0);
  const totalCents = subtotalCents - discountCents;
  const paidCents = toCents(form.amount_paid || 0);
  return {
    subtotal: subtotalCents / 100,
    total: totalCents / 100,
    balance: (totalCents - paidCents) / 100,
    discountTooHigh: discountCents > subtotalCents,
    overpaid: paidCents > totalCents,
  };
}

export const balanceDue = (inv: Invoice) => (toCents(inv.total) - toCents(inv.amount_paid)) / 100;

// Voided invoices are closed: the backend rejects any change
export const canEdit = (inv: Invoice) => inv.payment_status !== 'voided';

// Only drafts can be deleted: invoices with payments or sent to SIN must be voided instead
export const canDelete = (inv: Invoice) =>
  inv.sin_status === 'pending_submission' && toCents(inv.amount_paid) === 0;

export function invoiceToFormState(inv: Invoice): FormState {
  return {
    patient_id: inv.patient_id,
    appointment_id: inv.appointment_id ?? '',
    receiver_name: inv.receiver_name,
    receiver_document_type: inv.receiver_document_type,
    receiver_document_number: inv.receiver_document_number ?? '',
    currency: inv.currency,
    items: inv.items.map((item) => ({
      description: item.description,
      quantity: String(Number(item.quantity)),
      unit_price: item.unit_price,
      sin_service_code: item.sin_service_code ?? '',
    })),
    discount: inv.discount,
    payment_method: inv.payment_method,
    amount_paid: inv.amount_paid,
    voided: inv.payment_status === 'voided',
    void_reason: inv.void_reason ?? '',
    sin_status: inv.sin_status,
    cuf: inv.cuf ?? '',
    notes: inv.notes ?? '',
  };
}
