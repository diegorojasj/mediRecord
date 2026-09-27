import type {
  Currency,
  PaymentMethod,
  PaymentStatus,
  ReceiverDocumentType,
  SINStatus,
} from '@/types/billing_type';

export type Field = { label: string; value?: string; mono?: boolean };

export type InvoiceClinic = {
  name: string;
  tagline?: string;
  legalName?: string;
  nit?: string;
  license?: string;
  address?: string;
  phones: string[];
  email?: string;
  website?: string;
  // Without a logo the sheet shows the name's first letter on an accent square
  logoUrl?: string;
};

export type InvoiceLine = {
  id: string;
  description: string;
  code?: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
};

// Everything the printed sheet needs, already detached from the API shapes
export type InvoiceView = {
  number: string;
  issuedAt: string;
  status: PaymentStatus;
  currency: Currency;
  billedTo: { name: string; documentType: ReceiverDocumentType; document?: string };
  patient: { name: string; document?: string; record?: string };
  payment: { method: PaymentMethod; paidAt?: string; voidedAt?: string; voidReason?: string };
  fiscal: { status: SINStatus; authorization?: string };
  items: InvoiceLine[];
  discount: number;
  amountPaid: number;
  notes?: string;
};

export type InvoiceTotals = {
  lines: number[];
  subtotal: number;
  discount: number;
  total: number;
  paid: number;
  balance: number;
};
