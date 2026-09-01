from pydantic import BaseModel
from typing import Optional

# from schemas.sensors import SensorResponse

class SensorNotificationsConfigBase(BaseModel):
    sensor_id: int
    sensor_notifications_config_event: str
    sensor_notifications_config_usage: Optional[bool] = None
    sensor_notifications_config_repeatnoti: Optional[int] = None
    sensor_notifications_config_rangetime: Optional[int] = None
    sensor_notifications_config_signal: Optional[str] = None
    sensor_notifications_config_condition_value: Optional[int] = None
    sensor_notifications_config_condition_sign: Optional[str] = None
    sensor_notifications_config_sensor_type: Optional[str] = None

class SensorNotificationsConfigCreate(SensorNotificationsConfigBase):
    pass

class SensorNotificationsConfigResponse(SensorNotificationsConfigBase):
    sensor_notifications_config_id: int
    # sensor: Optional[SensorResponse] = None

    class Config:
        from_attributes = True
        # orm_mode=True