from typing import Literal

# Patient demographics
Sex = Literal["Male", "Female", "other"]
BloodGroup = Literal["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
MaritalStatus = Literal["single", "married", "divorced", "widowed", "cohabitating"]
EducationLevel = Literal["none", "primary", "secondary", "technical", "university", "postgraduate"]
InsuranceType = Literal["SUS", "CNS", "private", "none"]
PrimaryLanguage = Literal["arabic", "bengali", "chinese", "english", "french", "german", "hindi",
                          "indonesian", "japanese", "korean", "portuguese", "russian", "spanish",
                          "swahili", "turkish", "urdu", "other"]

# Clinical encounters
CareType = Literal["outpatient", "emergency", "follow_up", "procedure"]
EncounterStatus = Literal["draft", "signed", "amended"]
DiagnosisType = Literal["primary", "secondary"]
DiagnosisCertainty = Literal["presumptive", "definitive"]
ExamUrgency = Literal["routine", "urgent", "stat"]
ExamType = Literal["laboratory", "imaging", "ancillary", "other"]

# Prescriptions
AdministrationRoute = Literal["oral", "IM", "IV", "SC", "topical", "ophthalmic",
                               "otic", "nasal", "rectal", "inhalation", "sublingual"]

# Appointments
AppointmentType = Literal["first_visit", "follow_up", "procedure", "teleconsult"]
AppointmentStatus = Literal["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"]
CancelledBy = Literal["patient", "doctor", "system"]

# Billing
ReceiverDocumentType = Literal["CI", "NIT", "no_name"]
Currency = Literal["BOB", "USD"]
PaymentMethod = Literal["cash", "qr", "transfer", "card", "credit"]
PaymentStatus = Literal["pending", "paid", "partial", "voided"]
SINStatus = Literal["pending_submission", "validated", "observed", "voided"]

# Informed consent
SignedBy = Literal["patient", "family_member", "legal_representative"]

# Activity log
ActivityAction = Literal["view", "create", "update", "sign", "amend", "print",
                         "export", "login", "failed_login", "logout"]
ResourceType = Literal["user", "patient", "encounter", "prescription",
                       "appointment", "invoice", "payment", "consent"]
