from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# from schemas.sensors import SensorResponse

class HistoryValueSensorBase(BaseModel):
    sensor_id: int
    history_value_sensor_value: str
    history_value_sensor_time: datetime

class HistoryValueSensorCreate(HistoryValueSensorBase):
    pass

class HistoryValueSensorResponse(HistoryValueSensorBase):
    history_value_sensor_id: int
    # sensor: Optional[SensorResponse]

    class Config:
        from_attributes = True