from pydantic import BaseModel
from datetime import date
from typing import Optional

from schemas.patient import PatientResponse

class MedicalHistoryBase(BaseModel):
    patient_id: int
    medical_history_inspect_date: date
    medical_history_docter: str
    medical_history_disease: Optional[str] 
    medical_history_type: str
    medical_history_medicine: Optional[str]
    medical_history_drug_allergy: Optional[str]
    medical_history_treatment_result: Optional[str] 

class MedicalHistoryCreate(MedicalHistoryBase):
    pass

class MedicalHistoryResponse(MedicalHistoryBase):
    med_history_id: int
    patient: Optional[PatientResponse]

    class Config:
        orm_mode: True