from beanie import PydanticObjectId
from fastapi import HTTPException, Request
from pydantic import ValidationError
from pymongo.errors import DuplicateKeyError

from ..models.doctor import Doctor

READ_ONLY_FIELDS = {"id", "revision_id", "created_at", "updated_at"}
DUPLICATE_REGISTRATION = "A doctor with this professional registration number already exists"


async def _get_or_404(id: str) -> Doctor:
    # _id is stored as an ObjectId: comparing it with the raw string never matches
    if not PydanticObjectId.is_valid(id):
        raise HTTPException(status_code=404, detail="Doctor not found")
    doctor = await Doctor.get(PydanticObjectId(id))
    if doctor is None:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor


async def get_doctors(id: str | None = None) -> Doctor | list[Doctor]:
    if id:
        return await _get_or_404(id)
    return await Doctor.find_all().to_list()


async def create_doctor(request: Request) -> Doctor:
    try:
        doctor = Doctor.model_validate_json(await request.body())
        await doctor.insert()
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail=exc.errors()) from exc
    except DuplicateKeyError as exc:
        raise HTTPException(status_code=409, detail=DUPLICATE_REGISTRATION) from exc
    return doctor


async def update_doctor(request: Request, id: str) -> Doctor:
    json_data = await request.json()
    doctor = await _get_or_404(id)
    updates = {
        field: value
        for field, value in json_data.items()
        if field in Doctor.model_fields and field not in READ_ONLY_FIELDS
    }
    # Validate the merged result so values are stored with their real types
    try:
        validated = Doctor.model_validate({**doctor.model_dump(), **updates})
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail=exc.errors()) from exc
    for field in updates:
        setattr(doctor, field, getattr(validated, field))
    try:
        await doctor.save()
    except DuplicateKeyError as exc:
        raise HTTPException(status_code=409, detail=DUPLICATE_REGISTRATION) from exc
    return doctor


async def delete_doctor(id: str) -> Doctor:
    doctor = await _get_or_404(id)
    await doctor.delete()
    return doctor
