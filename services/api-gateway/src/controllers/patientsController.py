from fastapi import Request

from .proxyController import forward_json

PATIENTS_SERVICE_NAME = "Patients service"


async def _forward_to_patients(request: Request, method: str, url: str, json_data=None):
    client = request.app.state.patients_client
    return await forward_json(
        client,
        method,
        url,
        service_name=PATIENTS_SERVICE_NAME,
        json_data=json_data,
    )


async def get_patients(request: Request, patient_id: str | None = None):
    """
    Get a specific patient or all patients.
    """
    url = f"/{patient_id}" if patient_id is not None else "/"
    return await _forward_to_patients(request, "GET", url)


async def create_patient(request: Request):
    """
    Create a patient.
    """
    json_data = await request.json()
    return await _forward_to_patients(request, "POST", "/", json_data=json_data)


async def update_patient(request: Request, patient_id: str):
    """
    Update a patient.
    """
    json_data = await request.json()
    url = f"/{patient_id}"
    return await _forward_to_patients(request, "PUT", url, json_data=json_data)


async def delete_patient(request: Request, patient_id: str):
    """
    Delete a patient.
    """
    url = f"/{patient_id}"
    return await _forward_to_patients(request, "DELETE", url)


async def get_patient_consts_sex(request: Request):
    return await _forward_to_patients(request, "GET", "/sex")


async def get_patient_consts_blood_group(request: Request):
    return await _forward_to_patients(request, "GET", "/blood-group")


async def get_patient_consts_marital_status(request: Request):
    return await _forward_to_patients(request, "GET", "/marital-status")


async def get_patient_consts_education_level(request: Request):
    return await _forward_to_patients(request, "GET", "/education-level")


async def get_patient_consts_insurance_type(request: Request):
    return await _forward_to_patients(request, "GET", "/insurance-type")


async def get_patient_consts_primary_language(request: Request):
    return await _forward_to_patients(request, "GET", "/primary-language")
