from fastapi import APIRouter, Request

from ..controllers.appointmentsController import (
    create_appointment,
    delete_appointment,
    get_appointment_consts_cancelled_by,
    get_appointment_consts_status,
    get_appointment_consts_type,
    get_appointments,
    update_appointment,
)

router = APIRouter(prefix="/appointments")


@router.get("/")
async def get_appointments_root(request: Request):
    return await get_appointments(request)


@router.post("/")
async def create_appointment_root(request: Request):
    return await create_appointment(request)


@router.get("/appointment-type")
async def get_consts_appointment_type(request: Request):
    return await get_appointment_consts_type(request)


@router.get("/appointment-status")
async def get_consts_appointment_status(request: Request):
    return await get_appointment_consts_status(request)


@router.get("/cancelled-by")
async def get_consts_cancelled_by(request: Request):
    return await get_appointment_consts_cancelled_by(request)


@router.get("/{appointment_id}")
async def get_appointment(request: Request, appointment_id: str):
    return await get_appointments(request, appointment_id)


@router.put("/{appointment_id}")
async def update_appointment_root(request: Request, appointment_id: str):
    return await update_appointment(request, appointment_id)


@router.delete("/{appointment_id}")
async def delete_appointment_root(request: Request, appointment_id: str):
    return await delete_appointment(request, appointment_id)
