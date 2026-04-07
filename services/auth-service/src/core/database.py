from beanie import Document
import os
from typing import Type

from beanie import init_beanie
from pydantic import BaseModel
from pymongo import AsyncMongoClient
from fastapi import FastAPI
from .models_registry import ALL_MODELS

def connection_string() -> str:
    user = os.getenv("DB_USER", "")
    password: str = os.getenv("DB_PASSWORD", "")
    host: str = os.getenv("DB_HOST", "localhost")
    port: str = os.getenv("DB_PORT", "5432")
    database: str = os.getenv("DB_NAME", "medirecord")
    replset: str = os.getenv("REPLICA_SET", "")
    params: list[str] = ["authSource=admin", "retryWrites=true", "w=majority", "directConnection=false"]
    if replset:
        params.append(f"replicaSet={replset}")

    return f"mongodb://{user}:{password}@{host}:{port}/{database}?{ '&'.join(params) }"

def mongo_client():
    pool_config = {
        "maxPoolSize": 500,
        "minPoolSize": 10,
        "retryWrites": True,
        "retryReads": True,
        "serverSelectionTimeoutMS": 10000,
        "connectTimeoutMS": 5000,
        "socketTimeoutMS": 20000,
        "waitQueueTimeoutMS": 10000,
        "appName": "auth-service",
        "maxIdleTimeMS": 30000
    }
    
    return AsyncMongoClient(
        connection_string(),
        **pool_config
    )

async def __connection(app: FastAPI) -> None:
    if not hasattr(app.state, "mongo_client"):
        app.state.mongo_client = mongo_client()
        app.state.db = app.state.mongo_client[os.getenv("DB_NAME", "medirecord")]

async def init_db(app: FastAPI) -> None:
    await __connection(app)
    await init_beanie(app.state.db, document_models=ALL_MODELS)

async def reload_models(app: FastAPI) -> None:
    existing = set(await app.state.db.list_collection_names())
    for model in ALL_MODELS:
        coll_name = model.get_collection_name()
        if coll_name not in existing:
            try:
                await app.state.db.create_collection(coll_name)
            except Exception:
                pass

async def aggregate_with_options[T: BaseModel](
    model: Type[Document],
    pipeline: list[dict],
    *,
    projection_model: Type[T] | None = None,
    allow_disk_use: bool = False,
    batch_size: int = 500,
) -> list[T] | list[dict]:
    cursor = await model.get_pymongo_collection().aggregate(
        pipeline, allowDiskUse=allow_disk_use, batchSize=batch_size
    )

    if projection_model:
        return [projection_model(**doc) async for doc in cursor]

    return [doc async for doc in cursor]
