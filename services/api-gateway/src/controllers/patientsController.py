import httpx
from fastapi import Request


async def get_patients(request: Request, patient_id: str | None = None):
    """
    Get a specific patient or all patients.
    """
    client: httpx.AsyncClient = request.app.state.patients_client
    url = "/"
    if patient_id is not None:
        url = f"{url}/{patient_id}"
    response = await client.get(url)
    response.raise_for_status()
    return response.json()


async def create_patient(request: Request):
    """
    Create a patient.
    """
    json_data = await request.json()
    client: httpx.AsyncClient = request.app.state.patients_client
    response = await client.post("/", json=json_data)
    response.raise_for_status()
    return response.json()


async def update_patient(request: Request, patient_id: str):
    """
    Update a patient.
    """
    json_data = await request.json()
    client: httpx.AsyncClient = request.app.state.patients_client
    url = f"/{patient_id}"
    response = await client.put(url, json=json_data)
    response.raise_for_status()
    return response.json()


async def delete_patient(request: Request, patient_id: str):
    """
    Delete a patient.
    """
    client: httpx.AsyncClient = request.app.state.patients_client
    url = f"/{patient_id}"
    response = await client.delete(url)
    response.raise_for_status()
    return response.json()


async def get_patient_consts_sex(request: Request):
    client: httpx.AsyncClient = request.app.state.patients_client
    response = await client.get("/sex")
    response.raise_for_status()
    return response.json()


async def get_patient_consts_blood_group(request: Request):
    client: httpx.AsyncClient = request.app.state.patients_client
    response = await client.get("/blood-group")
    response.raise_for_status()
    return response.json()


async def get_patient_consts_marital_status(request: Request):
    client: httpx.AsyncClient = request.app.state.patients_client
    response = await client.get("/marital-status")
    response.raise_for_status()
    return response.json()


async def get_patient_consts_education_level(request: Request):
    client: httpx.AsyncClient = request.app.state.patients_client
    response = await client.get("/education-level")
    response.raise_for_status()
    return response.json()


async def get_patient_consts_insurance_type(request: Request):
    client: httpx.AsyncClient = request.app.state.patients_client
    response = await client.get("/insurance-type")
    response.raise_for_status()
    return response.json()


async def get_patient_consts_primary_language(request: Request):
    client: httpx.AsyncClient = request.app.state.patients_client
    response = await client.get("/primary-language")
    response.raise_for_status()
    return response.json()