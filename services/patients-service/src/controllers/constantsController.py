from typing import get_args

from ..constants.global_constants import (
    Sex, BloodGroup, MaritalStatus, EducationLevel, InsuranceType, PrimaryLanguage,
    CareType, EncounterStatus, DiagnosisType, DiagnosisCertainty, ExamUrgency, ExamType,
    AdministrationRoute,
    AppointmentType, AppointmentStatus, CancelledBy,
    ReceiverDocumentType, Currency, PaymentMethod, PaymentStatus, SINStatus,
    SignedBy,
    ActivityAction, ResourceType,
)

# Patient demographics
def get_constants_sex(): return get_args(Sex)
def get_constants_blood_group(): return get_args(BloodGroup)
def get_constants_marital_status(): return get_args(MaritalStatus)
def get_constants_education_level(): return get_args(EducationLevel)
def get_constants_insurance_type(): return get_args(InsuranceType)
def get_constants_primary_language(): return get_args(PrimaryLanguage)

# Clinical encounters
def get_constants_care_type(): return get_args(CareType)
def get_constants_encounter_status(): return get_args(EncounterStatus)
def get_constants_diagnosis_type(): return get_args(DiagnosisType)
def get_constants_diagnosis_certainty(): return get_args(DiagnosisCertainty)
def get_constants_exam_urgency(): return get_args(ExamUrgency)
def get_constants_exam_type(): return get_args(ExamType)

# Prescriptions
def get_constants_administration_route(): return get_args(AdministrationRoute)

# Appointments
def get_constants_appointment_type(): return get_args(AppointmentType)
def get_constants_appointment_status(): return get_args(AppointmentStatus)
def get_constants_cancelled_by(): return get_args(CancelledBy)

# Billing
def get_constants_receiver_document_type(): return get_args(ReceiverDocumentType)
def get_constants_currency(): return get_args(Currency)
def get_constants_payment_method(): return get_args(PaymentMethod)
def get_constants_payment_status(): return get_args(PaymentStatus)
def get_constants_sin_status(): return get_args(SINStatus)

# Informed consent
def get_constants_signed_by(): return get_args(SignedBy)

# Activity log
def get_constants_activity_action(): return get_args(ActivityAction)
def get_constants_resource_type(): return get_args(ResourceType)
