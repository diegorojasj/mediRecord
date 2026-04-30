from contextlib import asynccontextmanager

from fastapi import FastAPI, Request

from .controllers.constantsController import (
    get_constants_blood_group,
    get_constants_education_level,
    get_constants_insurance_type,
    get_constants_marital_status,
    get_constants_primary_language,
    get_constants_sex,
)
from .controllers.patientsController import (
    create_patient,
    delete_patient,
    get_patients,
    update_patient,
)
from .core.database import init_db
from .models.patient import Patient


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db(app)
    yield
    app.state.mongo_client.close()


app = FastAPI(lifespan=lifespan)


# constants
@app.get("/sex")
async def get_patient_constants_sex():
    return get_constants_sex()

@app.get("/blood-group")
async def get_patient_constants_blood_group():
    return get_constants_blood_group()

@app.get("/marital-status")
async def get_patient_constants_marital_status():
    return get_constants_marital_status()

@app.get("/education-level")
async def get_patient_constants_education_level():
    return get_constants_education_level()

@app.get("/insurance-type")
async def get_patient_constants_insurance_type():
    return get_constants_insurance_type()

@app.get("/primary-language")
async def get_patient_constants_primary_language():
    return get_constants_primary_language()


# patient operations
@app.get("/", response_model=list[Patient], response_model_by_alias=False)
async def get_root():
    return await get_patients()

@app.post("/", response_model=Patient, response_model_by_alias=False)
async def create_patient_root(request: Request):
    return await create_patient(request)

@app.get("/{patient_id}", response_model=Patient | None, response_model_by_alias=False)
async def get_patient_root(patient_id: str):
    return await get_patients(patient_id)

@app.put("/{patient_id}", response_model=Patient | None, response_model_by_alias=False)
async def update_patient_root(request: Request, patient_id: str):
    return await update_patient(request, patient_id)

@app.delete("/{patient_id}", response_model=Patient | None, response_model_by_alias=False)
async def delete_patient_root(patient_id: str):
    return await delete_patient(patient_id)
