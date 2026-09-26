import os
from typing import Any

from beanie import init_beanie
from fastapi import FastAPI
from pymongo import AsyncMongoClient

from ..models.invoice import Invoice

ALL_MODELS = [Invoice]


def connection_string() -> str:
    user: str = os.getenv("DB_USER", "")
    password: str = os.getenv("DB_PASSWORD", "")
    host: str = os.getenv("DB_HOST", "database")
    port: str = os.getenv("DB_PORT", "27017")
    database: str = os.getenv("DB_NAME", "medirecord")
    replset: str = os.getenv("REPLICA_SET", "")
    params: list[str] = ["authSource=admin", "retryWrites=true", "w=majority", "directConnection=false"]
    if replset:
        params.append(f"replicaSet={replset}")
    return f"mongodb://{user}:{password}@{host}:{port}/{database}?{'&'.join(params)}"


def mongo_client() -> AsyncMongoClient[dict[str, Any]]:
    return AsyncMongoClient(
        connection_string(),
        maxPoolSize=500,
        minPoolSize=10,
        retryWrites=True,
        retryReads=True,
        serverSelectionTimeoutMS=10000,
        connectTimeoutMS=5000,
        socketTimeoutMS=20000,
        waitQueueTimeoutMS=10000,
        appName="billing-service",
        maxIdleTimeMS=30000,
    )



async def _connection(app: FastAPI) -> None:
    if not hasattr(app.state, "mongo_client"):
        app.state.mongo_client = mongo_client()
        app.state.db = app.state.mongo_client[os.getenv("DB_NAME", "medirecord")]


async def init_db(app: FastAPI) -> None:
    await _connection(app)
    await init_beanie(app.state.db, document_models=ALL_MODELS)
