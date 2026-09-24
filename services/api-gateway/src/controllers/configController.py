from fastapi import Request

from .proxyController import forward_json

CONFIG_SERVICE_NAME = "Config service"


async def _forward_to_config(request: Request, method: str, url: str, json_data=None):
    client = request.app.state.config_client
    return await forward_json(
        client,
        method,
        url,
        service_name=CONFIG_SERVICE_NAME,
        json_data=json_data,
    )


async def get_doctors(request: Request, doctor_id: str | None = None):
    """
    Get a specific doctor or all doctors.
    """
    url = f"/doctors/{doctor_id}" if doctor_id is not None else "/doctors/"
    return await _forward_to_config(request, "GET", url)


async def create_doctor(request: Request):
    """
    Create a doctor.
    """
    json_data = await request.json()
    return await _forward_to_config(request, "POST", "/doctors/", json_data=json_data)


async def update_doctor(request: Request, doctor_id: str):
    """
    Update a doctor.
    """
    json_data = await request.json()
    return await _forward_to_config(
        request,
        "PUT",
        f"/doctors/{doctor_id}",
        json_data=json_data,
    )


async def delete_doctor(request: Request, doctor_id: str):
    """
    Delete a doctor.
    """
    return await _forward_to_config(request, "DELETE", f"/doctors/{doctor_id}")


async def get_config_consts_week_days(request: Request):
    return await _forward_to_config(request, "GET", "/week-days")


async def get_config_consts_doctor_specialty(request: Request):
    return await _forward_to_config(request, "GET", "/doctor-specialty")


async def get_config_consts_doctor_status(request: Request):
    return await _forward_to_config(request, "GET", "/doctor-status")
