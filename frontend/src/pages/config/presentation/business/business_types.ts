export type FormState = {
  name: string;
  legal_name: string;
  slogan: string;
  logo: string;
  tax_id: string;
  health_license: string;
  phone: string;
  mobile: string;
  email: string;
  website: string;
  address: string;
  city: string;
  country: string;
};

export type TextField = Exclude<keyof FormState, 'logo'>;

export const INITIAL_STATE: FormState = {
  name: '',
  legal_name: '',
  slogan: '',
  logo: '',
  tax_id: '',
  health_license: '',
  phone: '',
  mobile: '',
  email: '',
  website: '',
  address: '',
  city: '',
  country: '',
};
