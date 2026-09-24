from fastapi import APIRouter, Request

from ..controllers.configController import (
    create_doctor,
    delete_doctor,
    get_config_consts_doctor_specialty,
    get_config_consts_doctor_status,
    get_config_consts_week_days,
    get_doctors,
    update_doctor,
)

router = APIRouter(prefix="/config")


# constants
@router.get("/week-days")
async def get_consts_week_days(request: Request):
    return await get_config_consts_week_days(request)


@router.get("/doctor-specialty")
async def get_consts_doctor_specialty(request: Request):
    return await get_config_consts_doctor_specialty(request)


@router.get("/doctor-status")
async def get_consts_doctor_status(request: Request):
    return await get_config_consts_doctor_status(request)


# doctor operations
@router.get("/doctors/")
async def get_doctors_root(request: Request):
    return await get_doctors(request)


@router.post("/doctors/")
async def create_doctor_root(request: Request):
    return await create_doctor(request)


@router.get("/doctors/{doctor_id}")
async def get_doctor(request: Request, doctor_id: str):
    return await get_doctors(request, doctor_id)


@router.put("/doctors/{doctor_id}")
async def update_doctor_root(request: Request, doctor_id: str):
    return await update_doctor(request, doctor_id)


@router.delete("/doctors/{doctor_id}")
async def delete_doctor_root(request: Request, doctor_id: str):
    return await delete_doctor(request, doctor_id)
