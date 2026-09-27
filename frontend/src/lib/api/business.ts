import type { FormState } from '@/pages/config/presentation/business/business_types';
import type { BusinessProfile } from '@/types/business_type';

const BASE = '/api/config';

async function errorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body.detail === 'string') return body.detail;
    // Validation errors: point at the first field that failed
    if (Array.isArray(body.detail) && body.detail[0]) {
      const { loc, msg } = body.detail[0];
      const field = String(loc?.at(-1) ?? '').replaceAll('_', ' ');
      return field ? `${field}: ${msg}` : msg;
    }
  } catch {
    // body is not JSON
  }
  return `${res.status}`;
}

// null while the clinic never saved its profile
export async function getBusinessProfile(): Promise<BusinessProfile | null> {
  const res = await fetch(`${BASE}/business`);
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

export async function saveBusinessProfile(form: FormState): Promise<BusinessProfile> {
  const res = await fetch(`${BASE}/business`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formToPayload(form)),
  });
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

// Empty inputs are stored as null so optional fields stay unset
function formToPayload(form: FormState) {
  return Object.fromEntries(
    Object.entries(form).map(([key, value]) => [key, value.trim() || null]),
  );
}

export function profileToFormState(profile: BusinessProfile): FormState {
  return {
    name: profile.name ?? '',
    legal_name: profile.legal_name ?? '',
    slogan: profile.slogan ?? '',
    logo: profile.logo ?? '',
    tax_id: profile.tax_id ?? '',
    health_license: profile.health_license ?? '',
    phone: profile.phone ?? '',
    mobile: profile.mobile ?? '',
    email: profile.email ?? '',
    website: profile.website ?? '',
    address: profile.address ?? '',
    city: profile.city ?? '',
    country: profile.country ?? '',
  };
}
