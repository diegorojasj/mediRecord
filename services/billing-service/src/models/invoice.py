"""Invoices — billing of consultations and procedures."""

from datetime import datetime
from decimal import Decimal
from typing import Annotated, Optional

from beanie import DecimalAnnotation, Indexed, PydanticObjectId
from pydantic import Field
from pymongo import ASCENDING, DESCENDING, IndexModel

from ..constants.global_constants import Currency, PaymentMethod, PaymentStatus, ReceiverDocumentType, SINStatus
from .base import TimestampedDocument, utcnow
from .embedded import InvoiceItem


class Invoice(TimestampedDocument):
    invoice_number: Annotated[str, Indexed(unique=True)]  # e.g. "INV-2026-00123", assigned by the service
    issue_date: datetime = Field(default_factory=utcnow)

    # Who and what is billed
    patient_id: PydanticObjectId
    appointment_id: Optional[PydanticObjectId] = None

    # Receiver (as printed on the invoice)
    receiver_name: str
    receiver_document_type: ReceiverDocumentType = "CI"
    receiver_document_number: Optional[str] = None  # not required for "no_name"

    # Amounts — subtotal and total are computed by the service from the items
    currency: Currency = "BOB"
    items: list[InvoiceItem] = Field(min_length=1)
    subtotal: DecimalAnnotation = Decimal("0")
    discount: DecimalAnnotation = Field(Decimal("0"), ge=0)
    total: DecimalAnnotation = Decimal("0")

    # Payment — status is derived from amount_paid, except "voided"
    payment_method: PaymentMethod = "cash"
    amount_paid: DecimalAnnotation = Field(Decimal("0"), ge=0)
    payment_status: PaymentStatus = "pending"
    paid_at: Optional[datetime] = None
    voided_at: Optional[datetime] = None
    void_reason: Optional[str] = None

    # SIN (tax authority) tracking
    sin_status: SINStatus = "pending_submission"
    cuf: Optional[str] = None  # Unique invoice code returned by SIN

    notes: Optional[str] = None
    created_by_id: Optional[PydanticObjectId] = None  # set from the logged-in user once auth is wired

    class Settings(TimestampedDocument.Settings):
        name = "invoices"
        indexes = [
            # Patient's billing history
            IndexModel(
                [
                    ("patient_id", ASCENDING),
                    ("issue_date", DESCENDING),
                ]
            ),
            # Dashboard: pending / partial invoices
            IndexModel(
                [
                    ("payment_status", ASCENDING),
                    ("issue_date", DESCENDING),
                ]
            ),
            IndexModel([("appointment_id", ASCENDING)]),
            IndexModel([("created_at", DESCENDING)]),
        ]
