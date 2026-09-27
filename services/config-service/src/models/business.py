from typing import Annotated, Optional

from pydantic import EmailStr, Field, StringConstraints

from .base import TimestampedDocument

# The logo is kept inline as a data URL, so it has to stay small
LOGO_MAX_LENGTH = 1_000_000  # ~730 KB image once base64 decoded
LOGO_PATTERN = r"^data:image/(png|jpeg|webp|svg\+xml);base64,[A-Za-z0-9+/=]+$"

Text = Annotated[str, StringConstraints(strip_whitespace=True, max_length=200)]


class BusinessProfile(TimestampedDocument):
    """The clinic's identity, shown on printed invoices and across the app. There is only one."""

    # Optional: the app falls back to its own name ("mediRecord") while it is empty
    name: Optional[Annotated[str, StringConstraints(strip_whitespace=True, max_length=120)]] = None
    legal_name: Optional[Text] = None  # Razón social, when it differs from the name
    slogan: Optional[Text] = None
    logo: Optional[Annotated[str, Field(max_length=LOGO_MAX_LENGTH, pattern=LOGO_PATTERN)]] = None

    tax_id: Optional[Text] = None  # NIT
    health_license: Optional[Text] = None  # Health ministry registration / license

    phone: Optional[Text] = None
    mobile: Optional[Text] = None  # Mobile / WhatsApp
    email: Optional[EmailStr] = None
    website: Optional[Text] = None

    address: Optional[Text] = None
    city: Optional[Text] = None
    country: Optional[Text] = None

    class Settings(TimestampedDocument.Settings):
        name = "business_profile"
