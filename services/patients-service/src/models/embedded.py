from decimal import Decimal
from datetime import datetime
from typing import Optional, List

from beanie import PydanticObjectId
from pydantic import BaseModel, Field

from .enums import (
    InsuranceType,
    DiagnosisType,
    DiagnosisCertainty,
    ExamType,
    ExamUrgency,
    AdministrationRoute,
)


# ---------------------------------------------------------------------------
# Address / contact
# ---------------------------------------------------------------------------
class Address(BaseModel):
    street: str
    number: Optional[str] = None
    zone_neighborhood: Optional[str] = None
    city: str
    state_province: str
    reference: Optional[str] = None
    country: str = "Bolivia"


class EmergencyContact(BaseModel):
    name: str
    relationship: str
    phone: str


class HealthInsurance(BaseModel):
    type: InsuranceType
    affiliation_number: Optional[str] = None
    provider: Optional[str] = None


# ---------------------------------------------------------------------------
# Medical History
# ---------------------------------------------------------------------------
class PatientHabits(BaseModel):
    tobacco: Optional[str] = None          # e.g. "10 cigarettes/day x 5 years"
    alcohol: Optional[str] = None
    drugs: Optional[str] = None
    physical_activity: Optional[str] = None
    diet: Optional[str] = None


class MedicalHistory(BaseModel):
    pathological: Optional[str] = None            # past diseases
    surgical: Optional[str] = None                # past surgeries
    family: Optional[str] = None                  # family history
    gyneco_obstetric: Optional[str] = None         # G/P, LMP, etc.
    allergies: List[str] = Field(default_factory=list)
    current_medications: List[str] = Field(default_factory=list)
    habits: Optional[PatientHabits] = None
    vaccines: Optional[str] = None


# ---------------------------------------------------------------------------
# Vital signs
# ---------------------------------------------------------------------------
class VitalSigns(BaseModel):
    """All fields optional — not every encounter measures everything.

    Units are fixed: mmHg, bpm, rpm, °C, %, kg, cm, mg/dL.
    """
    systolic_blood_pressure: Optional[int] = Field(None, ge=40, le=300)
    diastolic_blood_pressure: Optional[int] = Field(None, ge=20, le=200)
    heart_rate: Optional[int] = Field(None, ge=20, le=300)
    respiratory_rate: Optional[int] = Field(None, ge=5, le=80)
    temperature_celsius: Optional[float] = Field(None, ge=25.0, le=45.0)
    o2_saturation: Optional[int] = Field(None, ge=0, le=100)
    weight_kg: Optional[float] = Field(None, ge=0.1, le=500.0)
    height_cm: Optional[float] = Field(None, ge=10.0, le=260.0)
    bmi: Optional[float] = None  # computed when weight & height present
    blood_glucose_mg_dl: Optional[float] = Field(None, ge=0, le=2000)
    observations: Optional[str] = None


# ---------------------------------------------------------------------------
# Physical exam
# ---------------------------------------------------------------------------
class PhysicalExam(BaseModel):
    general: Optional[str] = None
    head_neck: Optional[str] = None
    cardiopulmonary: Optional[str] = None
    abdomen: Optional[str] = None
    genitourinary: Optional[str] = None
    neurological: Optional[str] = None
    extremities: Optional[str] = None
    skin_mucosa: Optional[str] = None
    other: Optional[str] = None


# ---------------------------------------------------------------------------
# Diagnoses (ICD-10 coded)
# ---------------------------------------------------------------------------
class Diagnosis(BaseModel):
    icd10_code: str                         # e.g. "I21.9"
    description: str
    type: DiagnosisType = DiagnosisType.PRIMARY
    certainty: DiagnosisCertainty = DiagnosisCertainty.PRESUMPTIVE


# ---------------------------------------------------------------------------
# Exam requests / results
# ---------------------------------------------------------------------------
class RequestedExam(BaseModel):
    type: ExamType
    description: str
    urgency: ExamUrgency = ExamUrgency.ROUTINE
    notes: Optional[str] = None


class ExamResult(BaseModel):
    type: ExamType
    description: str
    result_date: datetime
    file_url: Optional[str] = None          # S3/Lightsail bucket link
    observations: Optional[str] = None
    uploaded_by_id: Optional[PydanticObjectId] = None


# ---------------------------------------------------------------------------
# Prescription line items
# ---------------------------------------------------------------------------
class PrescribedMedication(BaseModel):
    """RM 0479 compliance: generic_name is REQUIRED."""
    generic_name: str                        # INN required
    brand_name: Optional[str] = None
    concentration: str                       # "500mg", "10mg/ml"
    pharmaceutical_form: str                 # "tablet", "syrup"
    administration_route: AdministrationRoute
    dose: str                                # "1 tablet"
    frequency: str                           # "every 8 hours"
    duration: str                            # "7 days"
    total_quantity: str                      # "21 tablets"
    special_instructions: Optional[str] = None


# ---------------------------------------------------------------------------
# Invoice line items
# ---------------------------------------------------------------------------
class InvoiceItem(BaseModel):
    description: str                         # "General medical consultation"
    quantity: Decimal = Decimal("1")
    unit_price: Decimal                      # Bs
    subtotal: Decimal                        # quantity * unit_price
    sin_service_code: Optional[str] = None   # SIN product/service code
    unit_of_measure: Optional[str] = None    # SIN-defined, e.g. "58" (service)
