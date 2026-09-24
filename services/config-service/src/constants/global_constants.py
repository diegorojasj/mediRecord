from pydantic import BaseModel
from typing import Literal, Dict, List

WeekDays = Literal["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
DoctorStatus = Literal["active", "inactive", "retired", "not_available", "suspended"]
DoctorSpecialty = Literal[
    # Primary care
    "general_practice", "family_medicine", "internal_medicine", "pediatrics", "geriatrics",
    # Internal medicine subspecialties
    "cardiology", "endocrinology", "gastroenterology", "hematology", "infectious_disease",
    "nephrology", "oncology", "pulmonology", "rheumatology", "allergy_immunology",
    # Neuro & mental health
    "neurology", "psychiatry", "child_psychiatry",
    # Surgical specialties
    "general_surgery", "cardiothoracic_surgery", "vascular_surgery", "neurosurgery",
    "orthopedic_surgery", "plastic_surgery", "pediatric_surgery", "colorectal_surgery",
    "oncologic_surgery", "urology", "otorhinolaryngology", "ophthalmology",
    "maxillofacial_surgery", "bariatric_surgery", "transplant_surgery",
    # Women's health
    "obstetrics_gynecology", "reproductive_medicine",
    # Pediatric subspecialties
    "neonatology", "pediatric_cardiology", "pediatric_neurology",
    # Skin
    "dermatology",
    # Diagnostics
    "radiology", "interventional_radiology", "nuclear_medicine", "pathology", "clinical_laboratory",
    # Acute & critical care
    "emergency_medicine", "critical_care", "anesthesiology",
    # Rehabilitation & other
    "physical_medicine_rehabilitation", "sports_medicine", "occupational_medicine",
    "preventive_medicine", "palliative_care", "pain_medicine", "sleep_medicine",
    "medical_genetics", "toxicology", "tropical_medicine", "nutrition",
    # Dental
    "dentistry", "orthodontics",
    "other",
]


class WorkingHours(BaseModel):
    week_days: Dict[WeekDays, List[int]]