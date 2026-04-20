import type { Sex, BloodGroup, MaritalStatus, EducationLevel, InsuranceType } from "@/types/type_patients"

export const SEX_LABEL: Record<Sex, string> = {
    M: "Male",
    F: "Female",
    other: "Other",
}

export const SEX_OPTIONS: { value: Sex; label: string }[] = [
    { value: "M", label: "Male" },
    { value: "F", label: "Female" },
    { value: "other", label: "Other" },
]

export const BLOOD_GROUP_LABEL: Record<BloodGroup, string> = {
    "A+": "A+", "A-": "A-",
    "B+": "B+", "B-": "B-",
    "AB+": "AB+", "AB-": "AB-",
    "O+": "O+", "O-": "O-",
}

export const BLOOD_GROUP_OPTIONS: { value: BloodGroup; label: string }[] = [
    { value: "A+", label: "A+" }, { value: "A-", label: "A-" },
    { value: "B+", label: "B+" }, { value: "B-", label: "B-" },
    { value: "AB+", label: "AB+" }, { value: "AB-", label: "AB-" },
    { value: "O+", label: "O+" }, { value: "O-", label: "O-" },
]

export const MARITAL_STATUS_LABEL: Record<MaritalStatus, string> = {
    single: "Single",
    married: "Married",
    divorced: "Divorced",
    widowed: "Widowed",
    cohabitating: "Cohabitating",
}

export const MARITAL_STATUS_OPTIONS: { value: MaritalStatus; label: string }[] = [
    { value: "single", label: "Single" },
    { value: "married", label: "Married" },
    { value: "divorced", label: "Divorced" },
    { value: "widowed", label: "Widowed" },
    { value: "cohabitating", label: "Cohabitating" },
]

export const EDUCATION_LEVEL_LABEL: Record<EducationLevel, string> = {
    none: "None",
    primary: "Primary",
    secondary: "Secondary",
    technical: "Technical",
    university: "University",
    postgraduate: "Postgraduate",
}

export const EDUCATION_LEVEL_OPTIONS: { value: EducationLevel; label: string }[] = [
    { value: "none", label: "None" },
    { value: "primary", label: "Primary" },
    { value: "secondary", label: "Secondary" },
    { value: "technical", label: "Technical" },
    { value: "university", label: "University" },
    { value: "postgraduate", label: "Postgraduate" },
]

export const INSURANCE_TYPE_LABEL: Record<InsuranceType, string> = {
    SUS: "SUS",
    CNS: "CNS",
    private: "Private",
    none: "None",
}

export const INSURANCE_TYPE_OPTIONS: { value: InsuranceType; label: string }[] = [
    { value: "SUS", label: "SUS" },
    { value: "CNS", label: "CNS" },
    { value: "private", label: "Private" },
    { value: "none", label: "None" },
]

export const PRIMARY_LANGUAGE_OPTIONS = [
    { value: "arabic", label: "Arabic" },
    { value: "bengali", label: "Bengali" },
    { value: "chinese", label: "Chinese" },
    { value: "english", label: "English" },
    { value: "french", label: "French" },
    { value: "german", label: "German" },
    { value: "hindi", label: "Hindi" },
    { value: "indonesian", label: "Indonesian" },
    { value: "japanese", label: "Japanese" },
    { value: "korean", label: "Korean" },
    { value: "portuguese", label: "Portuguese" },
    { value: "russian", label: "Russian" },
    { value: "spanish", label: "Spanish" },
    { value: "swahili", label: "Swahili" },
    { value: "turkish", label: "Turkish" },
    { value: "urdu", label: "Urdu" },
    { value: "other", label: "Other" },
]