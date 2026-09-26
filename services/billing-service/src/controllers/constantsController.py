from typing import get_args

from ..constants.global_constants import (
    ReceiverDocumentType, Currency, PaymentMethod, PaymentStatus, SINStatus,
)


# Billing
def get_constants_receiver_document_type(): return get_args(ReceiverDocumentType)
def get_constants_currency(): return get_args(Currency)
def get_constants_payment_method(): return get_args(PaymentMethod)
def get_constants_payment_status(): return get_args(PaymentStatus)
def get_constants_sin_status(): return get_args(SINStatus)
