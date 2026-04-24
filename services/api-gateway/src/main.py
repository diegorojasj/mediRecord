import os
import httpx
from fastapi import FastAPI
from contextlib import asynccontextmanager

from .routers import patientsRoute

@asynccontextmanager
async def lifespan(app: FastAPI):
    patients_url = os.environ.get("PATIENTS_SERVICE_URL", "http://patients-service:8004")
    async with httpx.AsyncClient(base_url=patients_url) as patients_client:
        app.state.patients_client = patients_client
        yield

app = FastAPI(lifespan=lifespan)

app.include_router(patientsRoute.router)