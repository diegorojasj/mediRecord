from typing import get_args

from ..constants.global_constants import (
    AppointmentType, AppointmentStatus, CancelledBy,
)


# Appointments
def get_constants_appointment_type(): return get_args(AppointmentType)
def get_constants_appointment_status(): return get_args(AppointmentStatus)
def get_constants_cancelled_by(): return get_args(CancelledBy)
