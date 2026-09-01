from pydantic import BaseModel
from datetime import date, time
from typing import Optional

from schemas.patient import PatientResponse

class PersonalBehaviorBase(BaseModel):
    patient_id: int
    personal_behavior_date: date
    personal_behavior_wake_time: Optional[time] 
    personal_behavior_duration: Optional[float] 
    personal_behavior_position: Optional[str] 
    personal_behavior_sleep_interruption_count: Optional[int] 
    personal_behavior_fall_asleep_time: Optional[time] 
    personal_behavior_noise_disruption_count: Optional[int] 
    personal_behavior_out_of_bed_duration: Optional[float] 

class PersonalBehaviorCreate(PersonalBehaviorBase):
    pass

class PersonalBehaviorResponse(PersonalBehaviorBase):
    personal_behavior_id: int
    patient: Optional[PatientResponse]

    class Config:
        orm_mode: True