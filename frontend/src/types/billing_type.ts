export type ReceiverDocumentType = 'CI' | 'NIT' | 'no_name';

export type Currency = 'BOB' | 'USD';

export type PaymentMethod = 'cash' | 'qr' | 'transfer' | 'card' | 'credit';

export type PaymentStatus = 'pending' | 'paid' | 'partial' | 'voided';

export type SINStatus = 'pending_submission' | 'validated' | 'observed' | 'voided';

// Money comes from the backend as decimal strings ("150.00") to avoid float rounding
export type InvoiceItem = {
  description: string;
  quantity: string;
  unit_price: string;
  subtotal: string;
  sin_service_code?: string | null;
  unit_of_measure?: string | null;
};

export type Invoice = {
  id: string;
  invoice_number: string;
  issue_date: string;
  patient_id: string;
  appointment_id?: string | null;
  receiver_name: string;
  receiver_document_type: ReceiverDocumentType;
  receiver_document_number?: string | null;
  currency: Currency;
  items: InvoiceItem[];
  subtotal: string;
  discount: string;
  total: string;
  payment_method: PaymentMethod;
  amount_paid: string;
  payment_status: PaymentStatus;
  paid_at?: string | null;
  voided_at?: string | null;
  void_reason?: string | null;
  sin_status: SINStatus;
  cuf?: string | null;
  notes?: string | null;
  created_by_id?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
};
