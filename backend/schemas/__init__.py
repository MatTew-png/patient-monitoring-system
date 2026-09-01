# backend/schemas/__init__.py

# Import Pydantic models ทั้งหมด
from .buildings import BuildingBase, BuildingCreate, BuildingResponse, BuildingItem
from .floors import FloorBase, FloorCreate, FloorResponse, FloorItem
from .rooms import RoomBase, RoomCreate, RoomResponse, RoomItem
from .sensors import SensorBase, SensorCreate, SensorResponse, SensorWithConfigResponse, SensorOnlyResponse
# from .history_value_sensor import HistoryValueSensorBase, HistoryValueSensorCreate, HistoryValueSensorResponse # หากมี
# ... import schemas อื่นๆ ที่คุณมี เช่น users, notifications, etc.

from .patient import PatientBase, PatientCreate, PatientResponse, PatientFullDetailResponse
from .beds import (
    BedBase,
    BedCreate,
    BedUpdate, # ถ้ามี
    BedResponse,
    BedWithNestedDetailsResponse,
    BedOnlyResponse,
    BedSaveConfig,
    BedWithSensorConfigResponse
)

# เรียก model_rebuild() สำหรับ Pydantic models ที่ใช้ forward string references
PatientFullDetailResponse.model_rebuild()
BedResponse.model_rebuild()
if 'BedUpdate' in globals() and hasattr(globals()['BedUpdate'], 'model_rebuild'): # ตรวจสอบก่อนเรียก
    BedUpdate.model_rebuild()

# หากมี models อื่นๆ ใน schemas เหล่านี้ที่ใช้ forward references ก็ควรเรียก model_rebuild() ด้วย
# ตัวอย่าง:
# RoomResponse.model_rebuild() # ถ้า RoomResponse อ้างอิงถึง 'Something' ที่เป็น forward ref