from datetime import datetime, timezone
from typing import Any, Optional

from beanie import Document, PydanticObjectId, before_event, Insert, Replace, SaveChanges, Update
from pydantic import Field

# Matches documents that were never deleted: deleted_at is null or missing (older documents)
NOT_DELETED = {"deleted_at": None}


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class TimestampedDocument(Document):
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)
    # Soft delete: set to the deletion date instead of removing the document
    deleted_at: Optional[datetime] = None

    @before_event(Insert)
    def _set_created(self) -> None:
        now = utcnow()
        self.created_at = now
        self.updated_at = now

    @before_event(Replace, SaveChanges, Update)
    def _touch(self) -> None:
        self.updated_at = utcnow()

    @classmethod
    def find_active(cls, *filters: Any):
        """Like find(), skipping soft-deleted documents."""
        return cls.find(NOT_DELETED, *filters)

    @classmethod
    async def get_active(cls, id: str | PydanticObjectId):
        """The document with that id, or None when it doesn't exist or was soft-deleted."""
        if not PydanticObjectId.is_valid(id):
            return None
        return await cls.find_one({"_id": PydanticObjectId(id), **NOT_DELETED})

    async def soft_delete(self) -> None:
        self.deleted_at = utcnow()
        await self.save()

    class Settings:
        use_state_management = True
        validate_on_save = True
