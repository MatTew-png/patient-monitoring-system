import json
from typing import List, Optional
from pydantic import BaseModel, field_validator
from datetime import date, datetime

from schemas.rooms import RoomItem, RoomResponse
from schemas.patient import PatientResponse
from schemas.sensors import SensorResponse,SensorWithConfigResponse,SensorOnlyResponse

class BedBase(BaseModel):
    room_id: Optional[int] = None
    patient_id: Optional[int] = None
    bed_name: Optional[str] = None
    bed_activated: Optional[bool] = None
    selectedShowSensorId: Optional[List[int]] = None
    deleted_at: Optional[datetime] = None


class BedCreate(BedBase):
    pass

class BedUpdate(BedBase):
    bed_id:Optional[int] = None
    patient: Optional[PatientResponse] = None
    sensors: Optional[List[SensorResponse]] = None

class BedResponse(BedBase):
    bed_id: int
    room: Optional[RoomResponse] = None
    patient: Optional['PatientResponse'] = None
    sensors: Optional[List[SensorResponse]] = None

    @field_validator("selectedShowSensorId", mode="before")
    def parse_selected_sensors(cls, v):
        if isinstance(v, str):  
            return json.loads(v)  # แปลง JSON string -> list
        return v  # คืนค่าเดิมถ้าไม่ใช่ string

    class Config:
        from_attributes = True

class BedWithSensorConfigResponse(BedBase):
    bed_id:int
    room: Optional[RoomResponse] = None
    sensors:Optional[List[SensorWithConfigResponse]]
        
    @field_validator("selectedShowSensorId", mode="before")
    def parse_selected_sensors(cls, v):
        if isinstance(v, str):  
            return json.loads(v)  # แปลง JSON string -> list
        return v  # คืนค่าเดิมถ้าไม่ใช่ string

    class Config:
        from_attributes = True

class BedOnlyResponse(BedBase):
    bed_id:int
    room: Optional[RoomResponse] = None

    @field_validator("selectedShowSensorId", mode="before")
    def parse_selected_sensors(cls, v):
        if isinstance(v, str):  
            return json.loads(v)  # แปลง JSON string -> list
        return v  # คืนค่าเดิมถ้าไม่ใช่ string
    class Config:
        from_attributes = True

class BedSaveConfig(BaseModel):
    bed_id:int
    sensors:List[SensorOnlyResponse]=[]


class BedWithNestedDetailsResponse(BedBase):
    bed_id: int
    bed_name: Optional[str] = None # ใส่ field ที่ต้องการแสดงผลสำหรับเตียง
    bed_activated: Optional[bool] = None
    # selectedShowSensorId: Optional[List[int]] = None # สามารถใส่ field นี้ถ้าต้องการแสดงด้วย
    room: Optional[RoomItem] = None # ใช้ RoomItem สำหรับ nested room, floor, building
    sensors: Optional[List[SensorResponse]] = None # เพิ่ม sensors หากต้องการแสดง

    @field_validator("selectedShowSensorId", mode="before") # ถ้า selectedShowSensorId ยังคงถูกใช้ใน schema นี้
    def parse_selected_sensors_for_nested(cls, v): # เปลี่ยนชื่อ function validator เพื่อไม่ให้ซ้ำ
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return []
        return v

    class Config:
        from_attributes = True
