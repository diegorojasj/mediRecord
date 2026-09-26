import { fetchConst, type SelectOption } from '@/lib/utils';
import type { FormState } from '@/pages/billing/presentation/creationForm/creationForm_types';
import type {
  Currency,
  Invoice,
  PaymentMethod,
  PaymentStatus,
  ReceiverDocumentType,
  SINStatus,
} from '@/types/billing_type';

const BASE = '/api/billing';

// Constants come as snake_case ("pending_submission"), show them as "Pending submission"
const ACRONYMS = new Set(['qr']);
const humanize = <T extends string>(options: SelectOption<T>[]) =>
  options.map((o) => ({
    ...o,
    label: ACRONYMS.has(o.value) ? o.value.toUpperCase() : o.label.replaceAll('_', ' '),
  }));

export const getConstReceiverDocumentType = () =>
  fetchConst<ReceiverDocumentType>(BASE, '/receiver-document-type').then(humanize);
export const getConstCurrency = () => fetchConst<Currency>(BASE, '/currency');
export const getConstPaymentMethod = () =>
  fetchConst<PaymentMethod>(BASE, '/payment-method').then(humanize);
export const getConstPaymentStatus = () =>
  fetchConst<PaymentStatus>(BASE, '/payment-status').then(humanize);
export const getConstSINStatus = () => fetchConst<SINStatus>(BASE, '/sin-status').then(humanize);

export async function getAllBillingOptions() {
  const [receiverDocumentType, currency, paymentMethod, paymentStatus, sinStatus] =
    await Promise.all([
      getConstReceiverDocumentType(),
      getConstCurrency(),
      getConstPaymentMethod(),
      getConstPaymentStatus(),
      getConstSINStatus(),
    ]);
  return { receiverDocumentType, currency, paymentMethod, paymentStatus, sinStatus };
}

export type BillingOptions = Awaited<ReturnType<typeof getAllBillingOptions>>;

async function errorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body.detail === 'string') return body.detail;
    // FastAPI/Pydantic validation errors: [{ loc: [..., field], msg }, ...]
    if (Array.isArray(body.detail)) {
      return body.detail
        .map((e: { loc?: unknown[]; msg?: string }) => `${e.loc?.at(-1) ?? 'field'}: ${e.msg}`)
        .join('; ');
    }
  } catch {
    // body is not JSON
  }
  return `${res.status}`;
}

export async function getInvoices(): Promise<Invoice[]> {
  const res = await fetch(`${BASE}/invoices/`);
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

export async function createInvoice(form: FormState): Promise<Invoice> {
  const res = await fetch(`${BASE}/invoices/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formToPayload(form)),
  });
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

export async function updateInvoice(id: string, form: FormState): Promise<Invoice> {
  const res = await fetch(`${BASE}/invoices/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formToPayload(form)),
  });
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

// Soft delete: the backend keeps the record and marks it with deleted_at
export async function deleteInvoice(id: string): Promise<void> {
  const res = await fetch(`${BASE}/invoices/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await errorMessage(res));
}

// Empty optional inputs are sent as null: the backend accepts null, not "" (e.g. appointment_id is an ObjectId)
const orNull = (value: string) => value.trim() || null;
const orZero = (value: string) => value.trim() || '0';

function formToPayload(form: FormState) {
  return {
    patient_id: form.patient_id,
    appointment_id: orNull(form.appointment_id),
    receiver_name: form.receiver_name,
    receiver_document_type: form.receiver_document_type,
    receiver_document_number: orNull(form.receiver_document_number),
    currency: form.currency,
    // Subtotals and totals are computed by the backend
    items: form.items.map((item) => ({
      description: item.description,
      quantity: orZero(item.quantity),
      unit_price: orZero(item.unit_price),
      sin_service_code: orNull(item.sin_service_code),
    })),
    discount: orZero(form.discount),
    payment_method: form.payment_method,
    amount_paid: orZero(form.amount_paid),
    // Paid / partial / pending is derived by the backend from amount_paid; voiding is explicit
    payment_status: form.voided ? 'voided' : 'pending',
    void_reason: form.voided ? orNull(form.void_reason) : null,
    sin_status: form.sin_status,
    cuf: orNull(form.cuf),
    notes: orNull(form.notes),
  };
}
