from fastapi import HTTPException, Request
from pydantic import ValidationError

from ..models.appointments import Appointments

READ_ONLY_FIELDS = {"id", "created_at", "updated_at"}


async def get_appointments(id: str | None = None) -> Appointments | list[Appointments] | None:
    if id:
        return await Appointments.find_one(Appointments.id == id)
    return await Appointments.find_all().to_list()


async def create_appointment(request: Request) -> Appointments:
    try:
        appointment = Appointments.model_validate_json(await request.body())
        await appointment.insert()
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail=exc.errors()) from exc
    return appointment


async def update_appointment(request: Request, id: str) -> Appointments | None:
    json_data = await request.json()
    appointment = await Appointments.find_one(Appointments.id == id)
    if appointment:
        for field, value in json_data.items():
            if field in Appointments.model_fields and field not in READ_ONLY_FIELDS:
                setattr(appointment, field, value)
        await appointment.save()
    return appointment


async def delete_appointment(id: str) -> Appointments | None:
    appointment = await Appointments.find_one(Appointments.id == id)
    if appointment:
        await appointment.delete()
    return appointment
