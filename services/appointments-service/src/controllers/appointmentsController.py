import os
from datetime import datetime
from zoneinfo import ZoneInfo

from fastapi import HTTPException, Request
from pydantic import ValidationError
from pymongo.asynchronous.database import AsyncDatabase

from ..models.appointments import Appointments

READ_ONLY_FIELDS = {"id", "revision_id", "created_at", "updated_at", "deleted_at"}
# Appointments in these statuses no longer hold the doctor's time
INACTIVE_STATUSES = ["cancelled", "no_show"]
# Once an appointment has started, what was booked is part of the history and can't change;
# its outcome (status, cancellation, notes, links) still can, e.g. to mark it as completed
LOCKED_ONCE_STARTED_FIELDS = {"patient_id", "doctor_id", "start_datetime", "end_datetime", "type", "reason"}
# Doctors live in the config service's collection of the shared database
DOCTORS_COLLECTION = "doctor"
# Invoices live in the billing service's collection of the shared database
INVOICES_COLLECTION = "invoices"


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


def _naive(value: datetime) -> datetime:
    return value.replace(tzinfo=None)


def _has_started(appointment: Appointments) -> bool:
    return _naive(appointment.start_datetime) <= _clinic_now()


def _ensure_started_fields_unchanged(appointment: Appointments, validated: Appointments, updates: dict) -> None:
    """Ongoing and past appointments keep what was booked: only their outcome can change."""
    if not _has_started(appointment):
        return

    def value(source: Appointments, field: str):
        current = getattr(source, field)
        return _naive(current) if isinstance(current, datetime) else current

    locked = [
        field
        for field in updates
        if field in LOCKED_ONCE_STARTED_FIELDS and value(validated, field) != value(appointment, field)
    ]
    if locked:
        raise HTTPException(
            status_code=409,
            detail=f"The appointment has already started, these fields can't change: {', '.join(locked)}",
        )


def _ensure_not_moved_to_the_past(appointment: Appointments, validated: Appointments) -> None:
    """An upcoming appointment can be rescheduled, but only to a time that hasn't passed."""
    if _naive(validated.start_datetime) == _naive(appointment.start_datetime):
        return
    if _naive(validated.start_datetime) <= _clinic_now():
        raise HTTPException(status_code=422, detail="An appointment can't be moved to a time that has already passed")


async def _ensure_doctor_is_assigned(db: AsyncDatabase, appointment: Appointments) -> None:
    """The appointment's doctor must exist, not be deleted, and be active."""
    doctor = await db[DOCTORS_COLLECTION].find_one(
        {"_id": appointment.doctor_id, "deleted_at": None},
        {"status": 1},
    )
    if doctor is None:
        raise HTTPException(status_code=422, detail="The appointment must be assigned to an existing doctor")
    if doctor.get("status", "active") != "active":
        raise HTTPException(status_code=422, detail="The assigned doctor isn't active")


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
    await _ensure_doctor_is_assigned(request.app.state.db, appointment)
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
    started = _has_started(appointment)
    _ensure_started_fields_unchanged(appointment, validated, updates)
    _ensure_not_moved_to_the_past(appointment, validated)
    doctor_changed = validated.doctor_id != appointment.doctor_id
    for field in updates:
        setattr(appointment, field, getattr(validated, field))
    _apply_schedule_rules(appointment)
    # Existing appointments keep their doctor even if it was deactivated later
    if doctor_changed:
        await _ensure_doctor_is_assigned(request.app.state.db, appointment)
    # A started appointment keeps its time, so an old overlap can't block recording its outcome
    if not started:
        await _ensure_doctor_is_free(appointment)
    await appointment.save()
    return appointment


async def _ensure_appointment_can_be_deleted(db: AsyncDatabase, appointment: Appointments) -> None:
    """Only upcoming appointments nothing else points to can be deleted; the rest are cancelled."""
    # Ongoing and past appointments are part of the history
    if _has_started(appointment):
        raise HTTPException(
            status_code=409,
            detail="Appointments that have already started or ended can't be deleted",
        )
    if appointment.encounter_id is not None:
        raise HTTPException(
            status_code=409,
            detail="The appointment has a clinical encounter and can't be deleted, cancel it instead",
        )
    # Voided invoices still count: they are part of the fiscal record and point to this appointment
    invoice = await db[INVOICES_COLLECTION].find_one(
        {"appointment_id": appointment.id, "deleted_at": None},
        {"invoice_number": 1},
    )
    if invoice is not None:
        raise HTTPException(
            status_code=409,
            detail=(
                f"The appointment is billed by invoice {invoice.get('invoice_number')} "
                "and can't be deleted, cancel it instead"
            ),
        )


async def delete_appointment(request: Request, id: str) -> Appointments:
    appointment = await _get_or_404(id)
    await _ensure_appointment_can_be_deleted(request.app.state.db, appointment)
    await appointment.soft_delete()
    return appointment
