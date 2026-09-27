export type BusinessProfile = {
  id: string;
  name?: string | null;
  legal_name?: string | null;
  slogan?: string | null;
  // Image data URL ("data:image/png;base64,...")
  logo?: string | null;
  tax_id?: string | null;
  health_license?: string | null;
  phone?: string | null;
  mobile?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  created_at: string;
  updated_at: string;
};
