import type { Patient } from "@/types/type_patients"
import type { FormState } from "@/pages/patients/presentation/creationForm/creationForm_types"

const BASE = "/api/patients"

export type SelectOption = { value: string; label: string }

function toOptions(values: string[]): SelectOption[] {
  return values.map(v => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }))
}

async function fetchConst(path: string): Promise<SelectOption[]> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`${res.status}`)
  return toOptions(await res.json())
}

export const getConstSex = () => fetchConst("/sex")
export const getConstBloodGroup = () => fetchConst("/blood-group")
export const getConstMaritalStatus = () => fetchConst("/marital-status")
export const getConstEducationLevel = () => fetchConst("/education-level")
export const getConstInsuranceType = () => fetchConst("/insurance-type")
export const getConstPrimaryLanguage = () => fetchConst("/primary-language")

export async function getAllPatientOptions() {
  const [sex, bloodGroup, maritalStatus, educationLevel, insuranceType, primaryLanguage] =
    await Promise.all([
      getConstSex(),
      getConstBloodGroup(),
      getConstMaritalStatus(),
      getConstEducationLevel(),
      getConstInsuranceType(),
      getConstPrimaryLanguage(),
    ])
  return { sex, bloodGroup, maritalStatus, educationLevel, insuranceType, primaryLanguage }
}

export type PatientOptions = Awaited<ReturnType<typeof getAllPatientOptions>>

export async function getPatients(): Promise<Patient[]> {
  const res = await fetch(`${BASE}/`)
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}

export async function createPatient(form: FormState): Promise<Patient> {
  const res = await fetch(`${BASE}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formToPayload(form)),
  })
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}

export async function updatePatient(id: string, form: FormState): Promise<Patient> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formToPayload(form)),
  })
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
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
        ...(form.insurance_affiliation_number && { affiliation_number: form.insurance_affiliation_number }),
        ...(form.insurance_provider && { provider: form.insurance_provider }),
      },
    }),
    ...(form.administrative_notes && { administrative_notes: form.administrative_notes }),
  }
}
