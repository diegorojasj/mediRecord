from fastapi import Request
from fastapi import FastAPI

from .controllers.patientsController import get_patients
from .controllers.constantsController import get_constants_blood_group
from .controllers.constantsController import get_constants_education_level
from .controllers.constantsController import get_constants_insurance_type
from .controllers.constantsController import get_constants_marital_status
from .controllers.constantsController import get_constants_primary_language
from .controllers.constantsController import get_constants_sex
from .controllers.patientsController import create_patient
from .controllers.patientsController import update_patient
from .controllers.patientsController import delete_patient

app = FastAPI()

@app.get("/")
async def get_root():
    return await get_patients()

@app.get("/{patient_id}")
async def get_patient_root(patient_id: str):
    return await get_patients(patient_id)

@app.post("/")
async def create_patient_root(request: Request):
    return await create_patient(request)

@app.put("/{patient_id}")
async def update_patient_root(request: Request, patient_id: str):
    return await update_patient(request, patient_id)

@app.delete("/{patient_id}")
async def delete_patient_root(patient_id: str):
    return await delete_patient(patient_id)

# Constants
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
