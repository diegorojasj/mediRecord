from decimal import Decimal
from typing import Optional

from beanie import DecimalAnnotation
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Invoice line items
# ---------------------------------------------------------------------------
class InvoiceItem(BaseModel):
    description: str                                     # "General medical consultation"
    quantity: DecimalAnnotation = Field(Decimal("1"), gt=0)
    unit_price: DecimalAnnotation = Field(ge=0)          # in the invoice currency
    subtotal: DecimalAnnotation = Decimal("0")           # quantity * unit_price, computed by the service
    sin_service_code: Optional[str] = None               # SIN product/service code
    unit_of_measure: Optional[str] = None                # SIN-defined, e.g. "58" (service)
