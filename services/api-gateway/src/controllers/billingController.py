from fastapi import Request

from .proxyController import forward_json

BILLING_SERVICE_NAME = "Billing service"


async def _forward_to_billing(request: Request, method: str, url: str, json_data=None):
    client = request.app.state.billing_client
    return await forward_json(
        client,
        method,
        url,
        service_name=BILLING_SERVICE_NAME,
        json_data=json_data,
    )


async def get_invoices(request: Request, invoice_id: str | None = None):
    """
    Get a specific invoice or all invoices.
    """
    url = f"/invoices/{invoice_id}" if invoice_id is not None else "/invoices/"
    return await _forward_to_billing(request, "GET", url)


async def create_invoice(request: Request):
    """
    Create an invoice.
    """
    json_data = await request.json()
    return await _forward_to_billing(request, "POST", "/invoices/", json_data=json_data)


async def update_invoice(request: Request, invoice_id: str):
    """
    Update an invoice.
    """
    json_data = await request.json()
    return await _forward_to_billing(
        request,
        "PUT",
        f"/invoices/{invoice_id}",
        json_data=json_data,
    )


async def delete_invoice(request: Request, invoice_id: str):
    """
    Delete an invoice.
    """
    return await _forward_to_billing(request, "DELETE", f"/invoices/{invoice_id}")


async def get_billing_consts_receiver_document_type(request: Request):
    return await _forward_to_billing(request, "GET", "/receiver-document-type")


async def get_billing_consts_currency(request: Request):
    return await _forward_to_billing(request, "GET", "/currency")


async def get_billing_consts_payment_method(request: Request):
    return await _forward_to_billing(request, "GET", "/payment-method")


async def get_billing_consts_payment_status(request: Request):
    return await _forward_to_billing(request, "GET", "/payment-status")


async def get_billing_consts_sin_status(request: Request):
    return await _forward_to_billing(request, "GET", "/sin-status")
