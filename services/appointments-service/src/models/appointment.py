"""Appointments — calendar/agenda."""
from datetime import datetime, timezone
from typing import Optional

from beanie import PydanticObjectId, before_event, Insert, Replace, Update
from pymongo import ASCENDING, DESCENDING, IndexModel

from .base import TimestampedDocument
from ..constants.global_constants import AppointmentType, AppointmentStatus, CancelledBy


class Appointment(TimestampedDocument):
    patient_id: PydanticObjectId
    doctor_id: PydanticObjectId

    start_datetime: datetime
    end_datetime: datetime
    duration_minutes: int                # denormalized for easy display

    type: AppointmentType
    reason: Optional[str] = None         # short, non-clinical
    status: AppointmentStatus = "scheduled"

    # State transitions timestamps
    confirmed_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None
    cancellation_reason: Optional[str] = None
    cancelled_by: Optional[CancelledBy] = None

    # Links created after the fact
    encounter_id: Optional[PydanticObjectId] = None
    invoice_id: Optional[PydanticObjectId] = None

    # Reminders (WhatsApp/SMS tracking)
    reminder_sent: bool = False
    reminder_sent_at: Optional[datetime] = None

    notes: Optional[str] = None
    created_by_id: PydanticObjectId

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @before_event([Insert, Replace, Update])
    def update_timestamp(self):
        """Update Timestamp."""
        self.updated_at = datetime.now(timezone.utc)
    class Settings(TimestampedDocument.Settings):
        name = "appointments"
        indexes = [
            # Doctor's daily agenda view
            IndexModel([
                ("doctor_id", ASCENDING),
                ("start_datetime", ASCENDING),
            ]),
            # Patient's appointment history
            IndexModel([
                ("patient_id", ASCENDING),
                ("start_datetime", DESCENDING),
            ]),
            # Dashboard: today's active appointments
            IndexModel([
                ("status", ASCENDING),
                ("start_datetime", ASCENDING),
            ]),
            IndexModel([("created_at", DESCENDING)]),
        ]
