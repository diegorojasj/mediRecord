import type { FormState, ItemFormState } from './creationForm_types';

export const EMPTY_ITEM: ItemFormState = {
  description: '',
  quantity: '1',
  unit_price: '',
  sin_service_code: '',
};

export const INITIAL_STATE: FormState = {
  patient_id: '',
  appointment_id: '',
  receiver_name: '',
  receiver_document_type: 'CI',
  receiver_document_number: '',
  currency: 'BOB',
  items: [EMPTY_ITEM],
  discount: '0',
  payment_method: 'cash',
  amount_paid: '0',
  voided: false,
  void_reason: '',
  sin_status: 'pending_submission',
  cuf: '',
  notes: '',
};
