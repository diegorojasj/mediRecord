from typing import Annotated, Optional

from beanie import Indexed, Link
from pydantic import EmailStr
from pymongo import ASCENDING, IndexModel

from .base import TimestampedDocument
from .role import Role


class User(TimestampedDocument):
    email: Annotated[EmailStr, Indexed(unique=True)]
    password_hash: str
    full_name: str
    role: Link[Role]
    national_ID: str # CI
    professional_registration_number: Optional[str] = None
    specialty: Optional[str] = None
    medical_college_number: Optional[str] = None
    phone: Optional[str] = None
    signature_image_url: Optional[str] = None
    seal_image_url: Optional[str] = None
    is_active: bool = True

    class Settings(TimestampedDocument.Settings):
        name = "users"
        indexes = [
            IndexModel([("role", ASCENDING)]),
            IndexModel([("professional_registration_number", ASCENDING)],
                       unique=True, sparse=True),
            IndexModel([("ci", ASCENDING)], unique=True),
            IndexModel([("is_active", ASCENDING)]),
        ]
