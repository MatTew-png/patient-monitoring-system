from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from schemas.sensor_notifications_config import SensorNotificationsConfigResponse
from schemas.beds import BedOnlyResponse
from schemas.patient import PatientResponse
from schemas.sensors import SensorOnlyResponse

# class BaseModel:
#     pass

class NotificationBase(BaseModel):
    log_bed_patient_sensor_id: int 
    sensor_notifications_config_id: int
    notification_successed: Optional[bool] = None
    notification_category: Optional[str] = None
    notification_accepted: Optional[bool] = None
    notification_createdate: Optional[datetime] = None
    notification_updatedate: Optional[datetime] = None

class NotificationCreate(NotificationBase):
    pass

class NotificationResponse(NotificationBase):
    notification_id: int
    sensor_notifications_config: Optional[SensorNotificationsConfigResponse] = None
    # log_bed_patient_sensor: Optional[LogBedPatientSensorResponse] = None

    class Config:
        from_attributes = True
        # orm_mode = True

class LogBedPatientSensorResponse(BaseModel):
    log_bed_patient_sensor_id: int
    bed: Optional[BedOnlyResponse] = None
    patient: Optional[PatientResponse] = None
    sensor: Optional[SensorOnlyResponse] = None

class NotificationWarnResponse(NotificationBase):
    notification_id: int
    sensor_notifications_config: Optional[SensorNotificationsConfigResponse] = None
    log_bed_patient_sensor: Optional[LogBedPatientSensorResponse] = None

class NotificationCreateWarning(BaseModel):
    sensor_id:int
    sensor_value:str
    sensor_unit:str