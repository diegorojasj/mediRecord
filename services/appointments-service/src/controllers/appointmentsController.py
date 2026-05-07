from fastapi import HTTPException, Request
from pydantic import ValidationError

from ..models.appointment import Appointment

READ_ONLY_FIELDS = { "id", "created_at", "updated_at" }

async def get_appointments(id: str | None = None):
    if id:
        return await Appointment.find_one(Appointment.id == id)
    return await Appointment.find_all().to_list()


async def create_appointment(request: Request):
    json_data = await request.json()
    try:
        appointment = Appointment(**json_data)
        await appointment.insert()
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail=exc.errors()) from exc
    return appointment


async def update_appointment(request: Request, id: str):
    json_data = await request.json()
    appointment = await Appointment.find_one(Appointment.id == id)
    if appointment:
        for field, value in json_data.items():
            if field in Appointment.model_fields and field not in READ_ONLY_FIELDS:
                setattr(appointment, field, value)
        await appointment.save()
    return appointment


async def delete_appointment(id: str):
    appointment = await Appointment.find_one(Appointment.id == id)
    if appointment:
        await appointment.delete()
    return appointment
