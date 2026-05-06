from datetime import datetime, timezone

from beanie import Document, before_event, Insert, Replace, SaveChanges, Update
from pydantic import Field


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class TimestampedDocument(Document):
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)

    @before_event(Insert)
    def _set_created(self) -> None:
        now = utcnow()
        self.created_at = now
        self.updated_at = now

    @before_event(Replace, SaveChanges, Update)
    def _touch(self) -> None:
        self.updated_at = utcnow()

    class Settings:
        use_state_management = True
        validate_on_save = True
