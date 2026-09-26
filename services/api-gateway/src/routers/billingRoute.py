from fastapi import APIRouter, Request

from ..controllers.billingController import (
    create_invoice,
    delete_invoice,
    get_billing_consts_currency,
    get_billing_consts_payment_method,
    get_billing_consts_payment_status,
    get_billing_consts_receiver_document_type,
    get_billing_consts_sin_status,
    get_invoices,
    update_invoice,
)

router = APIRouter(prefix="/billing")


# constants
@router.get("/receiver-document-type")
async def get_consts_receiver_document_type(request: Request):
    return await get_billing_consts_receiver_document_type(request)


@router.get("/currency")
async def get_consts_currency(request: Request):
    return await get_billing_consts_currency(request)


@router.get("/payment-method")
async def get_consts_payment_method(request: Request):
    return await get_billing_consts_payment_method(request)


@router.get("/payment-status")
async def get_consts_payment_status(request: Request):
    return await get_billing_consts_payment_status(request)


@router.get("/sin-status")
async def get_consts_sin_status(request: Request):
    return await get_billing_consts_sin_status(request)


# invoice operations
@router.get("/invoices/")
async def get_invoices_root(request: Request):
    return await get_invoices(request)


@router.post("/invoices/")
async def create_invoice_root(request: Request):
    return await create_invoice(request)


@router.get("/invoices/{invoice_id}")
async def get_invoice(request: Request, invoice_id: str):
    return await get_invoices(request, invoice_id)


@router.put("/invoices/{invoice_id}")
async def update_invoice_root(request: Request, invoice_id: str):
    return await update_invoice(request, invoice_id)


@router.delete("/invoices/{invoice_id}")
async def delete_invoice_root(request: Request, invoice_id: str):
    return await delete_invoice(request, invoice_id)
