from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel



class BuildingBase(BaseModel):
    building_name: str
    deleted_at: Optional[datetime] = None


class BuildingCreate(BuildingBase):
    pass


class BuildingResponse(BuildingBase):
    building_id: int
    class Config:
        from_attributes = True

class BuildingItem(BaseModel):
    building_id: int
    building_name: str

    class Config:
        from_attributes = True

class FloorCreateForBuilding(BaseModel): 
    floor_name: str

class BuildingCreateWithFloors(BaseModel): 
    building_name: str
    floor_count: int
    
class BuildingUpdateWithFloorCount(BaseModel):
    building_name: str
    floor_count: int
