# backend/schemas/users.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from schemas.floors import FloorItem
from schemas.rooms import RoomItem
from schemas.wards import WardBase, WardResponse # เพิ่ม datetime

class UserBase(BaseModel):
    ward_id: Optional[int] = None
    user_name: str
    user_position: str
    user_username: str
    # user_password: str # ไม่ควรมี password ใน UserBase ที่จะใช้กับ response
    image_path: Optional[str] = None

class UserCreate(UserBase): # Schema สำหรับสร้าง User, ต้องการ password
    user_password: str

class UserUpdate(UserBase): # Schema สำหรับอัปเดต User, password เป็น optional
    ward_id: Optional[int]
    user_password: Optional[str] = None
    user_name: Optional[str] = None # ทำให้ fields อื่นๆ optional ด้วยสำหรับการ PATCH
    user_position: Optional[str] = None
    user_username: Optional[str] = None
    image_path: Optional[str] = None


class UserResponse(UserBase): # Schema สำหรับ Response, ไม่ควรมี password
    user_id: int
    ward_id: Optional[int]
    ward: Optional[WardResponse] = None   
    deleted_at: Optional[datetime] = None # เพิ่ม field นี้ (optional)

    class Config:
        from_attributes = True # สำหรับ Pydantic v2 หรือ orm_mode = True สำหรับ v1


class WardWithNestedDetailsResponseUser(WardBase):
    user_id: int
    user_name: Optional[str] = None # ใส่ field ที่ต้องการแสดงผลสำหรับเตียง
    room: Optional[List[RoomItem]] = None # ใช้ RoomItem สำหรับ nested room, floor, building
    deleted_at: Optional[datetime] = None 
    class Config:
        from_attributes = True