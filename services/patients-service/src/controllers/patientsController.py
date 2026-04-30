from datetime import date

from fastapi import HTTPException, Request
from pydantic import ValidationError
from pymongo.errors import DuplicateKeyError

from ..models.patient import Patient


async def _next_record_number(db) -> str:
    year = date.today().year
    result = await db["counters"].find_one_and_update(
        {"_id": f"record_number_{year}"},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True,
    )
    return f"EXP-{year}-{result['seq']:05d}"


async def get_patients(id: str | None = None):
    if id:
        return await Patient.find_one(Patient.id == id)
    return await Patient.find_all().to_list()

async def create_patient(request: Request):
    json_data = await request.json()
    json_data["record_number"] = await _next_record_number(request.app.state.db)
    try:
        patient = Patient(**json_data)
        await patient.insert()
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail=exc.errors()) from exc
    except DuplicateKeyError as exc:
        raise HTTPException(status_code=409, detail="Patient already exists") from exc
    return patient

async def update_patient(request: Request, id: str):
    json_data = await request.json()
    patient = await Patient.find_one(Patient.id == id)
    if patient:
        patient.name = json_data.get("name", patient.name)
        patient.email = json_data.get("email", patient.email)
        patient.phone = json_data.get("phone", patient.phone)
        await patient.save()
    return patient

async def delete_patient(id: str):
    patient = await Patient.find_one(Patient.id == id)
    if patient:
        await patient.delete()
    return patient