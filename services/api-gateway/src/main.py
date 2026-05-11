import os
import httpx
from fastapi import FastAPI
from contextlib import asynccontextmanager

from .routers import appointmentsRoute, patientsRoute

@asynccontextmanager
async def lifespan(app: FastAPI):
    patients_url = os.environ.get("PATIENTS_SERVICE_URL", "http://patients-service-dev:8004")
    appointments_url = os.environ.get("APPOINTMENTS_SERVICE_URL", "http://appointments-service-dev:8001")
    timeout = httpx.Timeout(10.0, connect=3.0)
    async with (
        httpx.AsyncClient(base_url=patients_url, timeout=timeout) as patients_client,
        httpx.AsyncClient(base_url=appointments_url, timeout=timeout) as appointments_client,
    ):
        app.state.patients_client = patients_client
        app.state.appointments_client = appointments_client
        yield

app = FastAPI(lifespan=lifespan)

app.include_router(patientsRoute.router)
app.include_router(appointmentsRoute.router)
