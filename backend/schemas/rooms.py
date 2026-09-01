from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

from schemas.floors import FloorItem, FloorResponse
from schemas.wards import WardBase, WardResponse


class RoomBase(BaseModel):
    room_name: str
    ward_id: Optional[int] = None
    floor_id: Optional[int]
    deleted_at: Optional[datetime] = None


class RoomCreate(RoomBase):
    pass


class RoomResponse(RoomBase):
    room_id: int
    ward_id: Optional[int] = None
    floor: Optional[FloorResponse] = None
    ward: Optional[WardResponse] = None   
    class Config:
        from_attributes = True

class RoomItem(BaseModel):
    room_id: int
    room_name: str
    ward_id: Optional[int] = None
    floor: Optional[FloorItem] = None # ใช้ FloorItem
    ward: Optional[WardResponse] = None 

    class Config:
        from_attributes = True


class WardWithNestedDetailsResponseRoom(WardBase):
    room: Optional[List[RoomItem]] = None
    deleted_at: Optional[datetime] = None 
    class Config:
        from_attributes = True

# backend/schemas/floors.py
class RoomUpdate(BaseModel):
    room_name: Optional[str] = None


class RoomCreateNew(RoomBase):
    room_name: str
    floor_id: int
    room_count: int  # จำนวนห้องที่ต้องการสร้าง