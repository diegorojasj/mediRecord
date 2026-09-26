import os
import httpx
from fastapi import FastAPI
from contextlib import asynccontextmanager

from .routers import appointmentsRoute, billingRoute, configRoute, patientsRoute

@asynccontextmanager
async def lifespan(app: FastAPI):
    patients_url = os.environ.get("PATIENTS_SERVICE_URL", "http://patients-service-dev:8004")
    appointments_url = os.environ.get("APPOINTMENTS_SERVICE_URL", "http://appointments-service-dev:8001")
    config_url = os.environ.get("CONFIG_SERVICE_URL", "http://config-service-dev:8005")
    billing_url = os.environ.get("BILLING_SERVICE_URL", "http://billing-service-dev:8003")
    timeout = httpx.Timeout(10.0, connect=3.0)
    async with (
        httpx.AsyncClient(base_url=patients_url, timeout=timeout) as patients_client,
        httpx.AsyncClient(base_url=appointments_url, timeout=timeout) as appointments_client,
        httpx.AsyncClient(base_url=config_url, timeout=timeout) as config_client,
        httpx.AsyncClient(base_url=billing_url, timeout=timeout) as billing_client,
    ):
        app.state.patients_client = patients_client
        app.state.appointments_client = appointments_client
        app.state.config_client = config_client
        app.state.billing_client = billing_client
        yield

app = FastAPI(lifespan=lifespan)

app.include_router(patientsRoute.router)
app.include_router(appointmentsRoute.router)
app.include_router(configRoute.router)
app.include_router(billingRoute.router)
