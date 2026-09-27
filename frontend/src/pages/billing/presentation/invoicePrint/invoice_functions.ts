import { format } from 'date-fns';
import { APP_NAME } from '@/consts/const_global';
import type { Invoice, PaymentMethod, PaymentStatus, SINStatus } from '@/types/billing_type';
import type { BusinessProfile } from '@/types/business_type';
import type { Patient } from '@/types/patients_type';
import { parseApiDate, patientName } from '../billing_functions';
import type {
  Field,
  InvoiceClinic,
  InvoiceLine,
  InvoiceTotals,
  InvoiceView,
} from './invoice_types';

const round2 = (x: number) => Math.round(x * 100) / 100;
// Sums in cents so long ledgers don't drift
const sum = (values: number[]) => values.reduce((acc, v) => acc + Math.round(v * 100), 0) / 100;

// Recomputed from the lines on purpose: the sheet never trusts stored totals
export function computeTotals(
  items: InvoiceLine[],
  discount: number,
  amountPaid: number,
): InvoiceTotals {
  const lines = items.map((item) => round2(item.quantity * item.unitPrice));
  const subtotal = sum(lines);
  const total = round2(subtotal - discount);
  return {
    lines,
    subtotal,
    discount: round2(discount),
    total,
    paid: round2(amountPaid),
    balance: round2(total - amountPaid),
  };
}

export const formatAmount = (value: number) =>
  value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatQuantity = (value: number) =>
  value.toLocaleString('en-US', { maximumFractionDigits: 3 });

export const formatIssued = (value?: string) =>
  value ? format(parseApiDate(value), 'dd/MM/yyyy HH:mm') : undefined;

export const formatDay = (value?: string) =>
  value ? format(parseApiDate(value), 'dd/MM/yyyy') : undefined;

export const STATUS_TEXT: Record<PaymentStatus, string> = {
  pending: 'Pending',
  paid: 'Paid',
  partial: 'Partially paid',
  voided: 'Void',
};

export const METHOD_TEXT: Record<PaymentMethod, string> = {
  cash: 'Cash',
  qr: 'QR payment',
  transfer: 'Bank transfer',
  card: 'Card',
  credit: 'Credit',
};

export const SIN_TEXT: Record<SINStatus, string> = {
  pending_submission: 'Pending submission',
  validated: 'Validated',
  observed: 'Flagged',
  voided: 'Void',
};

export const DOCUMENT_TYPE_TEXT = {
  CI: 'ID (CI)',
  NIT: 'Tax ID (NIT)',
  no_name: 'Document',
} as const;

// Drops empty values so optional data never leaves a dangling label
export const present = (fields: Field[]) => fields.filter((field) => field.value);

const orUndefined = (value?: string | null) => value || undefined;

export function toInvoiceClinic(business: BusinessProfile | null): InvoiceClinic {
  if (!business) return { name: APP_NAME, phones: [] };
  return {
    name: business.name || APP_NAME,
    tagline: orUndefined(business.slogan),
    legalName: orUndefined(business.legal_name),
    nit: orUndefined(business.tax_id),
    license: orUndefined(business.health_license),
    address: orUndefined(
      [business.address, business.city, business.country].filter(Boolean).join(', '),
    ),
    phones: [business.phone, business.mobile].filter((p): p is string => !!p),
    email: orUndefined(business.email),
    website: orUndefined(business.website),
    logoUrl: orUndefined(business.logo),
  };
}

export function toInvoiceView(invoice: Invoice, patient?: Patient): InvoiceView {
  return {
    number: invoice.invoice_number,
    issuedAt: invoice.issue_date,
    status: invoice.payment_status,
    currency: invoice.currency,
    billedTo: {
      name: invoice.receiver_name,
      documentType: invoice.receiver_document_type,
      document: orUndefined(invoice.receiver_document_number),
    },
    patient: {
      name: patient ? patientName(patient) : invoice.receiver_name,
      document: patient?.national_id,
      record: patient?.record_number,
    },
    payment: {
      method: invoice.payment_method,
      paidAt: orUndefined(invoice.paid_at),
      voidedAt: orUndefined(invoice.voided_at),
      voidReason: orUndefined(invoice.void_reason),
    },
    fiscal: { status: invoice.sin_status, authorization: orUndefined(invoice.cuf) },
    items: invoice.items.map((item, index) => ({
      id: String(index),
      description: item.description,
      code: orUndefined(item.sin_service_code),
      unit: orUndefined(item.unit_of_measure),
      quantity: Number(item.quantity),
      unitPrice: Number(item.unit_price),
    })),
    discount: Number(invoice.discount) || 0,
    amountPaid: Number(invoice.amount_paid) || 0,
    notes: orUndefined(invoice.notes),
  };
}

const cssString = (text: string) => JSON.stringify(text.replace(/[\r\n]+/g, ' '));

// A4 with 14 mm margins; the running footer lives in the bottom margin boxes
export const pageStyle = (clinicName: string, invoiceNumber: string) => `
  @page {
    size: A4;
    margin: 14mm;
    @bottom-left {
      content: ${cssString(`${clinicName} · ${invoiceNumber}`)};
      font: 7pt 'Inter Variable', Inter, sans-serif;
      color: oklch(0.556 0 0);
    }
    @bottom-right {
      content: "Page " counter(page) " of " counter(pages);
      font: 7pt 'Inter Variable', Inter, sans-serif;
      color: oklch(0.556 0 0);
    }
  }
  html, body {
    margin: 0;
    background: #fff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
`;
