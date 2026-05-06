from typing import Literal

AppointmentType = Literal["first_visit", "follow_up", "procedure", "teleconsult"]
AppointmentStatus = Literal["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"]
CancelledBy = Literal["patient", "doctor", "system"]
