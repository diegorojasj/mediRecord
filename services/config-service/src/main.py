from contextlib import asynccontextmanager

from fastapi import FastAPI, Request

from .controllers.constantsController import (
    get_constants_doctor_specialty,
    get_constants_doctor_status,
    get_constants_week_days,
)
from .controllers.doctorsController import (
    create_doctor,
    delete_doctor,
    get_doctors,
    update_doctor,
)
from .core.database import init_db
from .models.doctor import Doctor


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db(app)
    yield
    app.state.mongo_client.close()


app = FastAPI(lifespan=lifespan)


# constants
@app.get("/week-days")
async def get_config_constants_week_days():
    return get_constants_week_days()


@app.get("/doctor-specialty")
async def get_config_constants_doctor_specialty():
    return get_constants_doctor_specialty()


@app.get("/doctor-status")
async def get_config_constants_doctor_status():
    return get_constants_doctor_status()


# doctor operations
@app.get("/doctors/", response_model=list[Doctor], response_model_by_alias=False)
async def get_doctors_root():
    return await get_doctors()


@app.post("/doctors/", response_model=Doctor, response_model_by_alias=False)
async def create_doctor_root(request: Request):
    return await create_doctor(request)


@app.get("/doctors/{doctor_id}", response_model=Doctor | None, response_model_by_alias=False)
async def get_doctor_root(doctor_id: str):
    return await get_doctors(doctor_id)


@app.put("/doctors/{doctor_id}", response_model=Doctor | None, response_model_by_alias=False)
async def update_doctor_root(request: Request, doctor_id: str):
    return await update_doctor(request, doctor_id)


@app.delete("/doctors/{doctor_id}", response_model=Doctor | None, response_model_by_alias=False)
async def delete_doctor_root(doctor_id: str):
    return await delete_doctor(doctor_id)
