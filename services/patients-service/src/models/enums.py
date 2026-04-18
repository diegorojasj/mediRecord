from enum import Enum


# ---------------------------------------------------------------------------
# Patient demographics
# ---------------------------------------------------------------------------
class Sex(str, Enum):
    MALE = "M"
    FEMALE = "F"
    OTHER = "other"


class MaritalStatus(str, Enum):
    SINGLE = "single"
    MARRIED = "married"
    DIVORCED = "divorced"
    WIDOWED = "widowed"
    COHABITATING = "cohabitating"


class EducationLevel(str, Enum):
    NONE = "none"
    PRIMARY = "primary"
    SECONDARY = "secondary"
    TECHNICAL = "technical"
    UNIVERSITY = "university"
    POSTGRADUATE = "postgraduate"


class BloodGroup(str, Enum):
    A_POS = "A+"
    A_NEG = "A-"
    B_POS = "B+"
    B_NEG = "B-"
    AB_POS = "AB+"
    AB_NEG = "AB-"
    O_POS = "O+"
    O_NEG = "O-"


class InsuranceType(str, Enum):
    SUS = "SUS"      # Sistema Único de Salud
    CNS = "CNS"      # Caja Nacional de Salud
    PRIVATE = "private"
    NONE = "none"


class PrimaryLanguage(str, Enum):
    ARABIC = "arabic"
    BENGALI = "bengali"
    CHINESE = "chinese"
    ENGLISH = "english"
    FRENCH = "french"
    GERMAN = "german"
    HINDI = "hindi"
    INDONESIAN = "indonesian"
    JAPANESE = "japanese"
    KOREAN = "korean"
    PORTUGUESE = "portuguese"
    RUSSIAN = "russian"
    SPANISH = "spanish"
    SWAHILI = "swahili"
    TURKISH = "turkish"
    URDU = "urdu"
    OTHER = "other"


# ---------------------------------------------------------------------------
# Clinical encounters
# ---------------------------------------------------------------------------
class CareType(str, Enum):
    OUTPATIENT = "outpatient"
    EMERGENCY = "emergency"
    FOLLOW_UP = "follow_up"
    PROCEDURE = "procedure"


class EncounterStatus(str, Enum):
    DRAFT = "draft"          # editable
    SIGNED = "signed"        # immutable; amendments create a new doc
    AMENDED = "amended"      # this doc was replaced by a newer version


class DiagnosisType(str, Enum):
    PRIMARY = "primary"
    SECONDARY = "secondary"


class DiagnosisCertainty(str, Enum):
    PRESUMPTIVE = "presumptive"
    DEFINITIVE = "definitive"


class ExamUrgency(str, Enum):
    ROUTINE = "routine"
    URGENT = "urgent"
    STAT = "stat"


class ExamType(str, Enum):
    LABORATORY = "laboratory"
    IMAGING = "imaging"
    ANCILLARY = "ancillary"
    OTHER = "other"


# ---------------------------------------------------------------------------
# Prescriptions
# ---------------------------------------------------------------------------
class AdministrationRoute(str, Enum):
    ORAL = "oral"
    IM = "IM"
    IV = "IV"
    SC = "SC"
    TOPICAL = "topical"
    OPHTHALMIC = "ophthalmic"
    OTIC = "otic"
    NASAL = "nasal"
    RECTAL = "rectal"
    INHALATION = "inhalation"
    SUBLINGUAL = "sublingual"


# ---------------------------------------------------------------------------
# Appointments
# ---------------------------------------------------------------------------
class AppointmentType(str, Enum):
    FIRST_VISIT = "first_visit"
    FOLLOW_UP = "follow_up"
    PROCEDURE = "procedure"
    TELECONSULT = "teleconsult"


class AppointmentStatus(str, Enum):
    SCHEDULED = "scheduled"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"


class CancelledBy(str, Enum):
    PATIENT = "patient"
    DOCTOR = "doctor"
    SYSTEM = "system"


# ---------------------------------------------------------------------------
# Billing
# ---------------------------------------------------------------------------
class ReceiverDocumentType(str, Enum):
    CI = "CI"
    NIT = "NIT"
    NO_NAME = "no_name"     # allowed for invoices ≤ Bs 1000 per SIN rules


class Currency(str, Enum):
    BOB = "BOB"
    USD = "USD"


class PaymentMethod(str, Enum):
    CASH = "cash"
    QR = "qr"
    TRANSFER = "transfer"
    CARD = "card"
    CREDIT = "credit"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    PARTIAL = "partial"
    VOIDED = "voided"


class SINStatus(str, Enum):
    """Placeholder for future SIN integration."""
    PENDING_SUBMISSION = "pending_submission"
    VALIDATED = "validated"
    OBSERVED = "observed"
    VOIDED = "voided"


# ---------------------------------------------------------------------------
# Informed consent
# ---------------------------------------------------------------------------
class SignedBy(str, Enum):
    PATIENT = "patient"
    FAMILY_MEMBER = "family_member"
    LEGAL_REPRESENTATIVE = "legal_representative"


# ---------------------------------------------------------------------------
# Activity log
# ---------------------------------------------------------------------------
class ActivityAction(str, Enum):
    VIEW = "view"
    CREATE = "create"
    UPDATE = "update"
    SIGN = "sign"
    AMEND = "amend"
    PRINT = "print"
    EXPORT = "export"
    LOGIN = "login"
    FAILED_LOGIN = "failed_login"
    LOGOUT = "logout"


class ResourceType(str, Enum):
    USER = "user"
    PATIENT = "patient"
    ENCOUNTER = "encounter"
    PRESCRIPTION = "prescription"
    APPOINTMENT = "appointment"
    INVOICE = "invoice"
    PAYMENT = "payment"
    CONSENT = "consent"
