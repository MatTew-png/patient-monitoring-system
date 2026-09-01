from datetime import datetime
from typing import Optional
from pydantic import BaseModel

from schemas.buildings import BuildingResponse, BuildingItem


class FloorBase(BaseModel):
    floor_name: str
    building_id: int
    deleted_at: Optional[datetime] = None


class FloorCreate(FloorBase):
    pass

class FloorResponse(FloorBase):
    floor_id: int
    building: Optional[BuildingResponse] = None
    class Config:
        from_attributes = True

class FloorItem(BaseModel):
    floor_id: int
    floor_name: str
    building: Optional[BuildingItem] = None # ใช้ BuildingItem

    class Config:
        from_attributes = True

class FloorUpdate(BaseModel):
    floor_name: Optional[str] = None