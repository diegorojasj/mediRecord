from datetime import date

from fastapi import HTTPException, Request
from pydantic import ValidationError
from pymongo.asynchronous.database import AsyncDatabase
from pymongo.errors import DuplicateKeyError

from ..models.patient import Patient

# Other services' collections of the shared database that point to patients
APPOINTMENTS_COLLECTION = "appointments"
INVOICES_COLLECTION = "invoices"


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
        return await Patient.get_active(id)
    return await Patient.find_active().to_list()

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
    patient = await Patient.get_active(id)
    if patient:
        patient.name = json_data.get("name", patient.name)
        patient.email = json_data.get("email", patient.email)
        patient.phone = json_data.get("phone", patient.phone)
        await patient.save()
    return patient

async def _ensure_patient_can_be_deleted(db: AsyncDatabase, patient: Patient) -> None:
    """Patients with appointments or invoices are part of the medical and fiscal record."""
    query = {"patient_id": patient.id, "deleted_at": None}
    if await db[APPOINTMENTS_COLLECTION].find_one(query, {"_id": 1}) is not None:
        raise HTTPException(status_code=409, detail="The patient has appointments and can't be deleted")
    if await db[INVOICES_COLLECTION].find_one(query, {"_id": 1}) is not None:
        raise HTTPException(status_code=409, detail="The patient has invoices and can't be deleted")


async def delete_patient(request: Request, id: str):
    patient = await Patient.get_active(id)
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    await _ensure_patient_can_be_deleted(request.app.state.db, patient)
    await patient.soft_delete()
    return patient