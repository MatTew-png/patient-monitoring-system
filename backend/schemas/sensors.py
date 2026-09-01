from datetime import date, datetime
from pydantic import BaseModel
from typing import List, Optional

from schemas.history_value_sensor import HistoryValueSensorResponse
from schemas.sensor_notifications_config import SensorNotificationsConfigResponse


class SensorBase(BaseModel):
    bed_id: Optional[int] = None
    sensor_type: Optional[str] = None
    sensor_status: Optional[bool] = None
    sensor_mac_i:   Optional[str] = None
    sensor_mac_ii: Optional[str] = None
    sensor_unit: Optional[str] = None
    sensor_name: Optional[str] = None
    deleted_at: Optional[datetime] = None

class SensorCreate(SensorBase):
    pass


class SensorResponse(SensorBase):
    sensor_id: int
    history_value_sensor: Optional[List[HistoryValueSensorResponse]] = []

    class Config:
        orm_mode: True

class SensorWithConfigResponse(SensorBase):
    sensor_id: int
    sensor_notifications_config: Optional[List[SensorNotificationsConfigResponse]] = None

    class Config:
        orm_mode: True

class SensorOnlyResponse(SensorBase):
    sensor_id:int
    bed_id:Optional[int] = None

    class Config:
        from_attribute:True
