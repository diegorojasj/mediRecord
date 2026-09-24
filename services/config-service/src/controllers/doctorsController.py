from fastapi import HTTPException, Request
from pydantic import ValidationError
from pymongo.errors import DuplicateKeyError

from ..models.doctor import Doctor

READ_ONLY_FIELDS = {"id", "created_at", "updated_at"}
DUPLICATE_REGISTRATION = "A doctor with this professional registration number already exists"


async def get_doctors(id: str | None = None) -> Doctor | list[Doctor] | None:
    if id:
        return await Doctor.find_one(Doctor.id == id)
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


async def update_doctor(request: Request, id: str) -> Doctor | None:
    json_data = await request.json()
    doctor = await Doctor.find_one(Doctor.id == id)
    if doctor:
        for field, value in json_data.items():
            if field in Doctor.model_fields and field not in READ_ONLY_FIELDS:
                setattr(doctor, field, value)
        try:
            await doctor.save()
        except ValidationError as exc:
            raise HTTPException(status_code=422, detail=exc.errors()) from exc
        except DuplicateKeyError as exc:
            raise HTTPException(status_code=409, detail=DUPLICATE_REGISTRATION) from exc
    return doctor


async def delete_doctor(id: str) -> Doctor | None:
    doctor = await Doctor.find_one(Doctor.id == id)
    if doctor:
        await doctor.delete()
    return doctor
