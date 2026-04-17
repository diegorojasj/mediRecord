from .base import TimestampedDocument

class Role(TimestampedDocument):
    name: str
    permissions: list[str]