from contextlib import asynccontextmanager

from fastapi import FastAPI, Request

from .controllers.constantsController import (
    get_constants_currency,
    get_constants_payment_method,
    get_constants_payment_status,
    get_constants_receiver_document_type,
    get_constants_sin_status,
)
from .controllers.invoicesController import (
    create_invoice,
    delete_invoice,
    get_invoices,
    update_invoice,
)
from .core.database import init_db
from .models.invoice import Invoice


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db(app)
    yield
    app.state.mongo_client.close()


app = FastAPI(lifespan=lifespan)


# constants
@app.get("/receiver-document-type")
async def get_billing_constants_receiver_document_type():
    return get_constants_receiver_document_type()


@app.get("/currency")
async def get_billing_constants_currency():
    return get_constants_currency()


@app.get("/payment-method")
async def get_billing_constants_payment_method():
    return get_constants_payment_method()


@app.get("/payment-status")
async def get_billing_constants_payment_status():
    return get_constants_payment_status()


@app.get("/sin-status")
async def get_billing_constants_sin_status():
    return get_constants_sin_status()


# invoice operations
@app.get("/invoices/", response_model=list[Invoice], response_model_by_alias=False)
async def get_invoices_root():
    return await get_invoices()


@app.post("/invoices/", response_model=Invoice, response_model_by_alias=False)
async def create_invoice_root(request: Request):
    return await create_invoice(request)


@app.get("/invoices/{invoice_id}", response_model=Invoice | None, response_model_by_alias=False)
async def get_invoice_root(invoice_id: str):
    return await get_invoices(invoice_id)


@app.put("/invoices/{invoice_id}", response_model=Invoice | None, response_model_by_alias=False)
async def update_invoice_root(request: Request, invoice_id: str):
    return await update_invoice(request, invoice_id)


@app.delete("/invoices/{invoice_id}", response_model=Invoice | None, response_model_by_alias=False)
async def delete_invoice_root(invoice_id: str):
    return await delete_invoice(invoice_id)
