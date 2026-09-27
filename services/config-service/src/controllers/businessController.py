from fastapi import HTTPException, Request
from pydantic import ValidationError

from ..models.business import BusinessProfile

READ_ONLY_FIELDS = {"id", "revision_id", "created_at", "updated_at", "deleted_at"}


async def _current() -> BusinessProfile | None:
    return await BusinessProfile.find_active().first_or_none()


async def get_business_profile() -> BusinessProfile | None:
    """The clinic's profile, or None while it was never filled in."""
    return await _current()


async def save_business_profile(request: Request) -> BusinessProfile:
    """Creates the profile the first time, then replaces its fields on every save."""
    json_data = await request.json()
    fields = {
        field: value
        for field, value in json_data.items()
        if field in BusinessProfile.model_fields and field not in READ_ONLY_FIELDS
    }
    try:
        validated = BusinessProfile.model_validate(fields)
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail=exc.errors()) from exc

    profile = await _current()
    if profile is None:
        await validated.insert()
        return validated
    for field in BusinessProfile.model_fields.keys() - READ_ONLY_FIELDS:
        setattr(profile, field, getattr(validated, field))
    await profile.save()
    return profile
