from contextlib import asynccontextmanager
from fastapi import FastAPI

# Lifespan handler
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Application startup")
    yield
    print("Application shutdown")