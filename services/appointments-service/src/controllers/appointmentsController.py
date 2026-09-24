from datetime import datetime

from beanie import PydanticObjectId
from fastapi import HTTPException, Request
from pydantic import ValidationError

from ..models.appointments import Appointments

READ_ONLY_FIELDS = {"id", "revision_id", "created_at", "updated_at"}


def _apply_schedule_rules(appointment: Appointments) -> None:
    """Appointments happen within a single day; duration is derived from start/end."""
    start: datetime = appointment.start_datetime
    end: datetime = appointment.end_datetime
    if end <= start:
        raise HTTPException(status_code=422, detail="The appointment must end after it starts")
    if start.date() != end.date():
        raise HTTPException(status_code=422, detail="An appointment must start and end on the same day")
    appointment.duration_minutes = int((end - start).total_seconds() // 60)


async def _get_or_404(id: str) -> Appointments:
    # _id is stored as an ObjectId: comparing it with the raw string never matches
    if not PydanticObjectId.is_valid(id):
        raise HTTPException(status_code=404, detail="Appointment not found")
    appointment = await Appointments.get(PydanticObjectId(id))
    if appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment


async def get_appointments(id: str | None = None) -> Appointments | list[Appointments]:
    if id:
        return await _get_or_404(id)
    return await Appointments.find_all().to_list()


async def create_appointment(request: Request) -> Appointments:
    try:
        appointment = Appointments.model_validate_json(await request.body())
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail=exc.errors()) from exc
    _apply_schedule_rules(appointment)
    await appointment.insert()
    return appointment


async def update_appointment(request: Request, id: str) -> Appointments:
    json_data = await request.json()
    appointment = await _get_or_404(id)
    updates = {
        field: value
        for field, value in json_data.items()
        if field in Appointments.model_fields and field not in READ_ONLY_FIELDS
    }
    # Validate the merged result so values are stored with their real types
    # (ObjectId, datetime, Literal...) instead of the raw JSON strings
    try:
        validated = Appointments.model_validate({**appointment.model_dump(), **updates})
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail=exc.errors()) from exc
    for field in updates:
        setattr(appointment, field, getattr(validated, field))
    _apply_schedule_rules(appointment)
    await appointment.save()
    return appointment


async def delete_appointment(id: str) -> Appointments:
    appointment = await _get_or_404(id)
    await appointment.delete()
    return appointment
