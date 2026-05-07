from contextlib import asynccontextmanager

from fastapi import FastAPI, Request

from .controllers.appointmentsController import (
    create_appointment,
    delete_appointment,
    get_appointments,
    update_appointment,
)
from .controllers.constantsController import (
    get_constants_appointment_status,
    get_constants_appointment_type,
    get_constants_cancelled_by,
)
from .core.database import init_db
from .models.appointment import Appointment


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db(app)
    yield
    app.state.mongo_client.close()


app = FastAPI(lifespan=lifespan)


# constants
@app.get("/appointment-type")
async def get_appointment_constants_type():
    return get_constants_appointment_type()


@app.get("/appointment-status")
async def get_appointment_constants_status():
    return get_constants_appointment_status()


@app.get("/cancelled-by")
async def get_appointment_constants_cancelled_by():
    return get_constants_cancelled_by()


# appointment operations
@app.get("/", response_model=list[Appointment], response_model_by_alias=False)
async def get_root():
    return await get_appointments()


@app.post("/", response_model=Appointment, response_model_by_alias=False)
async def create_appointment_root(request: Request):
    return await create_appointment(request)


@app.get("/{appointment_id}", response_model=Appointment | None, response_model_by_alias=False)
async def get_appointment_root(appointment_id: str):
    return await get_appointments(appointment_id)


@app.put("/{appointment_id}", response_model=Appointment | None, response_model_by_alias=False)
async def update_appointment_root(request: Request, appointment_id: str):
    return await update_appointment(request, appointment_id)


@app.delete("/{appointment_id}", response_model=Appointment | None, response_model_by_alias=False)
async def delete_appointment_root(appointment_id: str):
    return await delete_appointment(appointment_id)
