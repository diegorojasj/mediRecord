from fastapi import Request

from .proxyController import forward_json

APPOINTMENTS_SERVICE_NAME = "Appointments service"


async def _forward_to_appointments(request: Request, method: str, url: str, json_data=None):
    client = request.app.state.appointments_client
    return await forward_json(
        client,
        method,
        url,
        service_name=APPOINTMENTS_SERVICE_NAME,
        json_data=json_data,
    )


async def get_appointments(request: Request, appointment_id: str | None = None):
    """
    Get a specific appointment or all appointments.
    """
    url = f"/{appointment_id}" if appointment_id is not None else "/"
    return await _forward_to_appointments(request, "GET", url)


async def create_appointment(request: Request):
    """
    Create an appointment.
    """
    json_data = await request.json()
    return await _forward_to_appointments(request, "POST", "/", json_data=json_data)


async def update_appointment(request: Request, appointment_id: str):
    """
    Update an appointment.
    """
    json_data = await request.json()
    return await _forward_to_appointments(
        request,
        "PUT",
        f"/{appointment_id}",
        json_data=json_data,
    )


async def delete_appointment(request: Request, appointment_id: str):
    """
    Delete an appointment.
    """
    return await _forward_to_appointments(request, "DELETE", f"/{appointment_id}")


async def get_appointment_consts_type(request: Request):
    return await _forward_to_appointments(request, "GET", "/appointment-type")


async def get_appointment_consts_status(request: Request):
    return await _forward_to_appointments(request, "GET", "/appointment-status")


async def get_appointment_consts_cancelled_by(request: Request):
    return await _forward_to_appointments(request, "GET", "/cancelled-by")
