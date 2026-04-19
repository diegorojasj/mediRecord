export const SEX_OPTIONS = [
  { value: "M", label: "Male" },
  { value: "F", label: "Female" },
  { value: "other", label: "Other" },
]

export const MARITAL_STATUS_OPTIONS = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
  { value: "cohabitating", label: "Cohabitating" },
]

export const EDUCATION_LEVEL_OPTIONS = [
  { value: "none", label: "None" },
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
  { value: "technical", label: "Technical" },
  { value: "university", label: "University" },
  { value: "postgraduate", label: "Postgraduate" },
]

export const BLOOD_GROUP_OPTIONS = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-",
].map((g) => ({ value: g, label: g }))

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

export const INSURANCE_TYPE_OPTIONS = [
  { value: "SUS", label: "SUS" },
  { value: "CNS", label: "CNS" },
  { value: "private", label: "Private" },
  { value: "none", label: "None" },
]