from typing import Literal

# Billing
ReceiverDocumentType = Literal["CI", "NIT", "no_name"]
Currency = Literal["BOB", "USD"]
PaymentMethod = Literal["cash", "qr", "transfer", "card", "credit"]
PaymentStatus = Literal["pending", "paid", "partial", "voided"]
SINStatus = Literal["pending_submission", "validated", "observed", "voided"]
