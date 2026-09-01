from typing import List, Optional
from pydantic import BaseModel
from datetime import date, datetime



class PatientBase(BaseModel):
    patient_name: str
    patient_age: int
    patient_gender: str
    patient_dob: date
    patient_disease: Optional[str]
    patient_status: str
    patient_date_in: date
    patient_bloodtype: Optional[str]
    deleted_at: Optional[datetime] = None
    image_path: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class PatientResponse(PatientBase):
    patient_id: int

    class Config:
        from_attributes = True

class PatientFullDetailResponse(PatientBase):
    patient_id: int
    bed: List['BedWithNestedDetailsResponse'] = []
    deleted_at: Optional[datetime] = None 

    class Config:
        from_attributes = True


