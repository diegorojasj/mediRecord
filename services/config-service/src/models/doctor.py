from typing import Annotated, Optional

from beanie import Indexed
from pymongo import ASCENDING, DESCENDING, IndexModel

from ..constants.global_constants import DoctorSpecialty, DoctorStatus, WorkingHours
from .base import TimestampedDocument


class Doctor(TimestampedDocument):
    first_name: str
    first_surname: str
    second_surname: Optional[str] = None

    specialty: DoctorSpecialty
    professional_registration_number: Annotated[str, Indexed(unique=True)]  # Professional license
    phone: str
    schedule: WorkingHours
    status: DoctorStatus = "active"

    class Settings(TimestampedDocument.Settings):
        name = "doctor"
        indexes = [
            IndexModel([("specialty", ASCENDING), ("status", ASCENDING)]),
            IndexModel([("created_at", DESCENDING)]),
        ]

    @property
    def full_name(self) -> str:
        parts = [self.first_name, self.first_surname]
        if self.second_surname:
            parts.append(self.second_surname)
        return " ".join(parts)
