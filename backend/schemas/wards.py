from typing import List, Optional
from pydantic import BaseModel
from datetime import date, datetime



class WardBase(BaseModel):
    ward_name: str


class WardCreate(WardBase):
    pass

class WardResponse(WardBase):
    ward_id: int

    class Config:
        from_attributes = True

class WardFullDetailResponse(WardBase):
    patient_id: int
    room: List['WardWithNestedDetailsResponseRoom'] = []
    user: List['WardWithNestedDetailsResponseUser'] = []
    deleted_at: Optional[datetime] = None 

    class Config:
        from_attributes = True

class WardCreateWithRooms(WardBase):
    room_ids: List[int] = [] # Add a list to hold the IDs of rooms to be assigned