from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from schemas.beds import BedOnlyResponse
from schemas.notifications import NotificationResponse
from schemas.patient import PatientResponse
from schemas.sensors import SensorWithConfigResponse

class LogBedPatientSensorBase(BaseModel):
    bed_id: int
    patient_id: int
    sensor_id: int
    log_bed_patient_sensor_date: datetime

    

class LogBedPatientSensorCreate(LogBedPatientSensorBase):
    pass

class LogBedPatientSensorResponse(LogBedPatientSensorBase):
    log_bed_patient_sensor_id: int
    notifications: Optional[list[NotificationResponse]] = []
    # bed: Optional[BedResponse] = None
    # patient: Optional[PatientResponse] = None
    # sensor: Optional[SensorResponse] = None

    class Config:
        from_attributes = True  # ✅ เปลี่ยนจาก orm_mode = True
        # orm_mode = True

class LogNotificationsWarnResponse(LogBedPatientSensorBase):
    log_bed_patient_sensor_id: int
    bed: Optional[BedOnlyResponse] = None
    patient: Optional[PatientResponse] = None
    sensor: Optional[SensorWithConfigResponse] = None

    class Config:
        from_attributes = True