export type ItemFormState = {
  description: string;
  quantity: string;
  unit_price: string;
  sin_service_code: string;
};

export type FormState = {
  // Billed
  patient_id: string;
  appointment_id: string;
  // Receiver
  receiver_name: string;
  receiver_document_type: string;
  receiver_document_number: string;
  // Amounts
  currency: string;
  items: ItemFormState[];
  discount: string;
  // Payment
  payment_method: string;
  amount_paid: string;
  voided: boolean;
  void_reason: string;
  // SIN
  sin_status: string;
  cuf: string;
  notes: string;
};

// Fields edited through plain inputs / selects (everything but the items and the void flag)
export type TextField = Exclude<keyof FormState, 'items' | 'voided'>;
