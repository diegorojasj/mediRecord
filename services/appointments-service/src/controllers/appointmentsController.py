import os
from datetime import datetime
from zoneinfo import ZoneInfo

from fastapi import HTTPException, Request
from pydantic import ValidationError

from ..models.appointments import Appointments

READ_ONLY_FIELDS = {"id", "revision_id", "created_at", "updated_at", "deleted_at"}
# Appointments in these statuses no longer hold the doctor's time
INACTIVE_STATUSES = ["cancelled", "no_show"]


def _apply_schedule_rules(appointment: Appointments) -> None:
    """Appointments happen within a single day; duration is derived from start/end."""
    start: datetime = appointment.start_datetime
    end: datetime = appointment.end_datetime
    if end <= start:
        raise HTTPException(status_code=422, detail="The appointment must end after it starts")
    if start.date() != end.date():
        raise HTTPException(status_code=422, detail="An appointment must start and end on the same day")
    appointment.duration_minutes = int((end - start).total_seconds() // 60)


def _clinic_now() -> datetime:
    """Current time as a naive local datetime, the way appointment times are stored.

    Set APP_TIMEZONE (e.g. "America/Bogota") when the server's clock isn't in the
    clinic's timezone, as in UTC containers.
    """
    tz = os.getenv("APP_TIMEZONE")
    now = datetime.now(ZoneInfo(tz)) if tz else datetime.now().astimezone()
    return now.replace(tzinfo=None)


async def _ensure_doctor_is_free(appointment: Appointments) -> None:
    """A doctor can't have two active appointments whose times overlap."""
    if appointment.status in INACTIVE_STATUSES:
        return
    query = {
        "deleted_at": None,
        "doctor_id": appointment.doctor_id,
        "status": {"$nin": INACTIVE_STATUSES},
        # Touching ends (one ends at 10:00, the next starts at 10:00) don't overlap
        "start_datetime": {"$lt": appointment.end_datetime},
        "end_datetime": {"$gt": appointment.start_datetime},
    }
    if appointment.id is not None:
        query["_id"] = {"$ne": appointment.id}
    conflict = await Appointments.find(query).first_or_none()
    if conflict is not None:
        raise HTTPException(
            status_code=409,
            detail=(
                "The doctor already has an appointment from "
                f"{conflict.start_datetime:%H:%M} to {conflict.end_datetime:%H:%M} on "
                f"{conflict.start_datetime:%Y-%m-%d}"
            ),
        )


async def _get_or_404(id: str) -> Appointments:
    appointment = await Appointments.get_active(id)
    if appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment


async def get_appointments(id: str | None = None) -> Appointments | list[Appointments]:
    if id:
        return await _get_or_404(id)
    return await Appointments.find_active().to_list()


async def create_appointment(request: Request) -> Appointments:
    try:
        appointment = Appointments.model_validate_json(await request.body())
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail=exc.errors()) from exc
    _apply_schedule_rules(appointment)
    await _ensure_doctor_is_free(appointment)
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
    await _ensure_doctor_is_free(appointment)
    await appointment.save()
    return appointment


async def delete_appointment(id: str) -> Appointments:
    appointment = await _get_or_404(id)
    # Only upcoming appointments can be deleted: ongoing and past ones are part of the history
    if appointment.start_datetime.replace(tzinfo=None) <= _clinic_now():
        raise HTTPException(
            status_code=409,
            detail="Appointments that have already started or ended can't be deleted",
        )
    await appointment.soft_delete()
    return appointment
