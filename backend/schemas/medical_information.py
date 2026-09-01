from pydantic import BaseModel
from datetime import date
from typing import Optional

from schemas.patient import PatientResponse

class MedicalInformationBase(BaseModel):
    patient_id: int
    medical_info_record_date: date
    medical_info_blood_pressure: Optional[str] 
    medical_info_pulse: Optional[int] 
    medical_info_respiration_rate: Optional[int] 
    medical_info_weight: Optional[float] 
    medical_info_height: Optional[float] 

class MedicalInformationCreate(MedicalInformationBase):
    pass

class MedicalInformationResponse(MedicalInformationBase):
    medical_info_id: int
    patient: Optional[PatientResponse]

    class Config:
        orm_mode: True