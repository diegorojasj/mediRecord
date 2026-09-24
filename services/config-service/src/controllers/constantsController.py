from typing import get_args

from ..constants.global_constants import (
    DoctorSpecialty, DoctorStatus, WeekDays,
)

def get_constants_week_days(): return get_args(WeekDays)


# Doctors
def get_constants_doctor_specialty(): return get_args(DoctorSpecialty)
def get_constants_doctor_status(): return get_args(DoctorStatus)
