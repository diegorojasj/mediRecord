import { fetchConst } from '@/lib/utils';
import type { FormState } from '@/pages/patients/presentation/creationForm/creationForm_types';
import type { Patient } from '@/types/patients_type';

const BASE = '/api/patients';

export const getConstSex = () => fetchConst(BASE, '/sex');
export const getConstBloodGroup = () => fetchConst(BASE, '/blood-group');
export const getConstMaritalStatus = () => fetchConst(BASE, '/marital-status');
export const getConstEducationLevel = () => fetchConst(BASE, '/education-level');
export const getConstInsuranceType = () => fetchConst(BASE, '/insurance-type');
export const getConstPrimaryLanguage = () => fetchConst(BASE, '/primary-language');

export async function getAllPatientOptions() {
  const [sex, bloodGroup, maritalStatus, educationLevel, insuranceType, primaryLanguage] =
    await Promise.all([
      getConstSex(),
      getConstBloodGroup(),
      getConstMaritalStatus(),
      getConstEducationLevel(),
      getConstInsuranceType(),
      getConstPrimaryLanguage(),
    ]);
  return { sex, bloodGroup, maritalStatus, educationLevel, insuranceType, primaryLanguage };
}

export type PatientOptions = Awaited<ReturnType<typeof getAllPatientOptions>>;

export async function getPatients(): Promise<Patient[]> {
  const res = await fetch(`${BASE}/`);
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

export async function createPatient(form: FormState): Promise<Patient> {
  const res = await fetch(`${BASE}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formToPayload(form)),
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

export async function updatePatient(id: string, form: FormState): Promise<Patient> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formToPayload(form)),
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

function formToPayload(form: FormState) {
  return {
    national_id: form.national_id,
    national_id_issued_in: form.national_id_issued_in,
    ...(form.tax_id && { tax_id: form.tax_id }),
    first_name: form.first_name,
    first_surname: form.first_surname,
    ...(form.second_surname && { second_surname: form.second_surname }),
    date_of_birth: form.date_of_birth,
    sex: form.sex,
    ...(form.marital_status && { marital_status: form.marital_status }),
    ...(form.occupation && { occupation: form.occupation }),
    ...(form.education_level && { education_level: form.education_level }),
    ...(form.blood_group && { blood_group: form.blood_group }),
    primary_language: form.primary_language,
    ...(form.indigenous_community && { indigenous_community: form.indigenous_community }),
    phone: form.phone,
    ...(form.alternative_phone && { alternative_phone: form.alternative_phone }),
    ...(form.email && { email: form.email }),
    address: {
      street: form.street,
      ...(form.address_number && { number: form.address_number }),
      ...(form.zone_neighborhood && { zone_neighborhood: form.zone_neighborhood }),
      city: form.city,
      state_province: form.state_province,
      ...(form.reference && { reference: form.reference }),
      country: form.country,
    },
    ...(form.emergency_name && {
      emergency_contact: {
        name: form.emergency_name,
        relationship: form.emergency_relationship,
        phone: form.emergency_phone,
      },
    }),
    ...(form.insurance_type && {
      health_insurance: {
        type: form.insurance_type,
        ...(form.insurance_affiliation_number && {
          affiliation_number: form.insurance_affiliation_number,
        }),
        ...(form.insurance_provider && { provider: form.insurance_provider }),
      },
    }),
    ...(form.administrative_notes && { administrative_notes: form.administrative_notes }),
  };
}
