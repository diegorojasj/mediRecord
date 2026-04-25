from fastapi import APIRouter, Request

from ..controllers.patientsController import (
    get_patients,
    create_patient,
    update_patient,
    delete_patient,
    get_patient_consts_sex,
    get_patient_consts_blood_group,
    get_patient_consts_marital_status,
    get_patient_consts_education_level,
    get_patient_consts_insurance_type,
    get_patient_consts_primary_language,
)

router = APIRouter(prefix="/patients")

@router.get("/")
async def get_patients_root(request: Request):
    return await get_patients(request)

@router.post("/")
async def create_patient_root(request: Request):
    return await create_patient(request)

# constants
@router.get("/sex")
async def get_consts_sex(request: Request):
    return await get_patient_consts_sex(request)

@router.get("/blood-group")
async def get_consts_blood_group(request: Request):
    return await get_patient_consts_blood_group(request)

@router.get("/marital-status")
async def get_consts_marital_status(request: Request):
    return await get_patient_consts_marital_status(request)

@router.get("/education-level")
async def get_consts_education_level(request: Request):
    return await get_patient_consts_education_level(request)

@router.get("/insurance-type")
async def get_consts_insurance_type(request: Request):
    return await get_patient_consts_insurance_type(request)

@router.get("/primary-language")
async def get_consts_primary_language(request: Request):
    return await get_patient_consts_primary_language(request)

# patient operations
@router.get("/{patient_id}")
async def get_patient(request: Request, patient_id: str):
    return await get_patients(request, patient_id)

@router.put("/{patient_id}")
async def update_patient_root(request: Request, patient_id: str):
    return await update_patient(request, patient_id)

@router.delete("/{patient_id}")
async def delete_patient_root(request: Request, patient_id: str):
    return await delete_patient(request, patient_id)

