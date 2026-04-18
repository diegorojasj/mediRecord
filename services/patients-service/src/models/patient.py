from datetime import date
from typing import Annotated, Optional

from beanie import Indexed, PydanticObjectId
from pydantic import EmailStr, Field
from pymongo import ASCENDING, DESCENDING, TEXT, IndexModel

from .base import TimestampedDocument
from .embedded import EmergencyContact, Address, HealthInsurance
from .enums import (
    MaritalStatus,
    EducationLevel,
    BloodGroup,
    PrimaryLanguage,
    Sex,
)


class Patient(TimestampedDocument):
    # Identification
    record_number: Annotated[str, Indexed(unique=True)]   # e.g. "EXP-2026-00123"
    national_id: Annotated[str, Indexed(unique=True)]    # Identity document number
    national_id_issued_in: str
    tax_id: Optional[str] = None                         # optional, for billing

    # Names (Bolivian pattern: two apellidos common)
    first_name: str
    first_surname: str
    second_surname: Optional[str] = None

    # Core demographics
    date_of_birth: date
    sex: Sex
    marital_status: Optional[MaritalStatus] = None
    occupation: Optional[str] = None
    education_level: Optional[EducationLevel] = None
    blood_group: Optional[BloodGroup] = None

    # Cultural / linguistic (constitutional context)
    primary_language: PrimaryLanguage = PrimaryLanguage.SPANISH
    indigenous_community: Optional[str] = None

    # Contact
    phone: str
    alternative_phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Address
    emergency_contact: Optional[EmergencyContact] = None

    # Insurance
    health_insurance: Optional[HealthInsurance] = None

    # Admin
    administrative_notes: Optional[str] = None
    registered_by_id: PydanticObjectId
    is_active: bool = True  # soft-delete only — never hard-delete (legal retention)

    class Settings(TimestampedDocument.Settings):
        name = "patients"
        indexes = [
            IndexModel([
                ("first_surname", ASCENDING),
                ("second_surname", ASCENDING),
                ("first_name", ASCENDING),
            ]),
            IndexModel([
                ("first_name", TEXT),
                ("first_surname", TEXT),
                ("second_surname", TEXT),
                ("national_id", TEXT),
                ("record_number", TEXT),
            ], name="patient_text_search"),
            IndexModel([("is_active", ASCENDING)]),
            IndexModel([("created_at", DESCENDING)]),
        ]

    @property
    def full_name(self) -> str:
        parts = [self.first_name, self.first_surname]
        if self.second_surname:
            parts.append(self.second_surname)
        return " ".join(parts)
