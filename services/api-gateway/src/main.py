import httpx
from fastapi import FastAPI
from contextlib import asynccontextmanager

from .routers import patientsRoute

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with httpx.AsyncClient(base_url="http://patients-service:8004") as patients_client:
        app.state.patients_client = patients_client
        yield

app = FastAPI(lifespan=lifespan)

app.include_router(patientsRoute.router)