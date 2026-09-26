from datetime import date
from decimal import ROUND_HALF_UP, Decimal

from fastapi import HTTPException, Request
from pydantic import ValidationError
from pymongo.errors import DuplicateKeyError

from ..models.base import utcnow
from ..models.invoice import Invoice

# Computed or assigned by the service, never taken from the request
READ_ONLY_FIELDS = {
    "id", "revision_id", "created_at", "updated_at", "deleted_at",
    "invoice_number", "subtotal", "total", "paid_at", "voided_at",
}
# Fields that can still change once SIN validated the invoice
SIN_EDITABLE_FIELDS = {"payment_method", "amount_paid", "payment_status", "void_reason", "notes", "sin_status", "cuf"}
# Invoices that no longer bill anything
INACTIVE_STATUSES = ["voided"]
CENTS = Decimal("0.01")
DUPLICATE_NUMBER = "An invoice with this number already exists, please try again"


def _money(value: Decimal) -> Decimal:
    return value.quantize(CENTS, rounding=ROUND_HALF_UP)


def _apply_receiver_rules(invoice: Invoice) -> None:
    """CI and NIT invoices must carry the document number; "no_name" invoices don't."""
    if invoice.receiver_document_type == "no_name":
        invoice.receiver_document_number = None
        return
    if not (invoice.receiver_document_number or "").strip():
        raise HTTPException(
            status_code=422,
            detail=f"The receiver's {invoice.receiver_document_type} number is required",
        )


def _apply_amount_rules(invoice: Invoice) -> None:
    """Line subtotals, subtotal and total are always derived from the items."""
    for item in invoice.items:
        item.subtotal = _money(item.quantity * item.unit_price)
    invoice.subtotal = _money(sum((item.subtotal for item in invoice.items), Decimal("0")))
    invoice.discount = _money(invoice.discount)
    if invoice.discount > invoice.subtotal:
        raise HTTPException(status_code=422, detail="The discount can't be greater than the subtotal")
    invoice.total = invoice.subtotal - invoice.discount
    invoice.amount_paid = _money(invoice.amount_paid)


def _apply_payment_rules(invoice: Invoice) -> None:
    """Payment status follows the amount paid; voiding is the only status set by hand."""
    if invoice.payment_status == "voided":
        invoice.voided_at = invoice.voided_at or utcnow()
        invoice.sin_status = "voided"
        return
    if invoice.amount_paid > invoice.total:
        raise HTTPException(status_code=422, detail="The amount paid can't be greater than the total")
    if invoice.amount_paid > 0 and invoice.amount_paid == invoice.total:
        invoice.payment_status = "paid"
        invoice.paid_at = invoice.paid_at or utcnow()
        return
    invoice.payment_status = "partial" if invoice.amount_paid > 0 else "pending"
    invoice.paid_at = None


def _apply_billing_rules(invoice: Invoice) -> None:
    _apply_receiver_rules(invoice)
    _apply_amount_rules(invoice)
    _apply_payment_rules(invoice)


async def _ensure_appointment_not_billed(invoice: Invoice) -> None:
    """An appointment is billed by a single active invoice."""
    if invoice.appointment_id is None or invoice.payment_status in INACTIVE_STATUSES:
        return
    query = {
        "deleted_at": None,
        "appointment_id": invoice.appointment_id,
        "payment_status": {"$nin": INACTIVE_STATUSES},
    }
    if invoice.id is not None:
        query["_id"] = {"$ne": invoice.id}
    conflict = await Invoice.find(query).first_or_none()
    if conflict is not None:
        raise HTTPException(
            status_code=409,
            detail=f"This appointment is already billed by invoice {conflict.invoice_number}",
        )


async def _next_invoice_number(db) -> str:
    year = date.today().year
    result = await db["counters"].find_one_and_update(
        {"_id": f"invoice_number_{year}"},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True,
    )
    return f"INV-{year}-{result['seq']:05d}"


async def _get_or_404(id: str) -> Invoice:
    invoice = await Invoice.get_active(id)
    if invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice


async def get_invoices(id: str | None = None) -> Invoice | list[Invoice]:
    if id:
        return await _get_or_404(id)
    return await Invoice.find_active().sort("-issue_date").to_list()


async def create_invoice(request: Request) -> Invoice:
    json_data = await request.json()
    try:
        # The real number is assigned after validation, so rejected invoices don't consume one
        invoice = Invoice.model_validate({**json_data, "invoice_number": "pending"})
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail=exc.errors()) from exc
    _apply_billing_rules(invoice)
    await _ensure_appointment_not_billed(invoice)
    invoice.invoice_number = await _next_invoice_number(request.app.state.db)
    try:
        await invoice.insert()
    except DuplicateKeyError as exc:
        raise HTTPException(status_code=409, detail=DUPLICATE_NUMBER) from exc
    return invoice


def _editable_updates(invoice: Invoice, json_data: dict) -> dict:
    if invoice.payment_status == "voided":
        raise HTTPException(status_code=409, detail="Voided invoices can't be modified")
    return {
        field: value
        for field, value in json_data.items()
        if field in Invoice.model_fields and field not in READ_ONLY_FIELDS
    }


def _ensure_sin_fields_unchanged(invoice: Invoice, validated: Invoice, updates: dict) -> None:
    """Once SIN validated the invoice, its content is fixed: only payment data can change."""
    if invoice.sin_status != "validated":
        return
    # Derive the amounts first so equal values compare equal ("150" vs "150.00", item subtotals)
    _apply_amount_rules(validated)
    locked = [
        field
        for field in updates
        if field not in SIN_EDITABLE_FIELDS and getattr(validated, field) != getattr(invoice, field)
    ]
    if locked:
        raise HTTPException(
            status_code=409,
            detail=f"The invoice was already validated by SIN, these fields can't change: {', '.join(locked)}",
        )


async def update_invoice(request: Request, id: str) -> Invoice:
    json_data = await request.json()
    invoice = await _get_or_404(id)
    updates = _editable_updates(invoice, json_data)
    # Validate the merged result so values are stored with their real types
    # (ObjectId, Decimal, Literal...) instead of the raw JSON strings
    try:
        validated = Invoice.model_validate({**invoice.model_dump(), **updates})
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail=exc.errors()) from exc
    _ensure_sin_fields_unchanged(invoice, validated, updates)
    for field in updates:
        setattr(invoice, field, getattr(validated, field))
    _apply_billing_rules(invoice)
    await _ensure_appointment_not_billed(invoice)
    await invoice.save()
    return invoice


async def delete_invoice(id: str) -> Invoice:
    invoice = await _get_or_404(id)
    # Invoices sent to SIN or with payments are part of the fiscal record: they are voided, not deleted
    if invoice.sin_status != "pending_submission" or invoice.amount_paid > 0:
        raise HTTPException(
            status_code=409,
            detail="Invoices submitted to SIN or with registered payments can't be deleted, void them instead",
        )
    await invoice.soft_delete()
    return invoice
