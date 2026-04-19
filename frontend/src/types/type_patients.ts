export type Sex = "M" | "F" | "other"

export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"
export type MaritalStatus = "single" | "married" | "divorced" | "widowed" | "cohabitating"
export type EducationLevel = "none" | "primary" | "secondary" | "technical" | "university" | "postgraduate"
export type InsuranceType = "SUS" | "CNS" | "private" | "none"

export type Address = {
    street: string
    number?: string
    zone_neighborhood?: string
    city: string
    state_province: string
    reference?: string
    country: string
}

export type EmergencyContact = {
    name: string
    relationship: string
    phone: string
}

export type HealthInsurance = {
    type: InsuranceType
    affiliation_number?: string
    provider?: string
}

export type Patient = {
    id: string
    photo_url?: string
    record_number: string
    national_id: string
    national_id_issued_in: string
    tax_id?: string
    first_name: string
    first_surname: string
    second_surname?: string
    date_of_birth: string
    sex: Sex
    marital_status?: MaritalStatus
    occupation?: string
    education_level?: EducationLevel
    blood_group?: BloodGroup
    primary_language: string
    indigenous_community?: string
    phone: string
    alternative_phone?: string
    email?: string
    address: Address
    emergency_contact?: EmergencyContact
    health_insurance?: HealthInsurance
    administrative_notes?: string
    is_active: boolean
}