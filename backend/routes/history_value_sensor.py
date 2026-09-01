from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks # <<< เพิ่ม BackgroundTasks
from sqlalchemy.orm import Session
from models import history_value_sensor as models
from schemas import history_value_sensor as schemas
from models.base import SessionLocal, get_db # <<< แก้ไข import get_db
import crud.history_value_sensor as crud

router = APIRouter(
    prefix="/history_value_sensors",
    tags=["history_value_sensors"],
    responses={404: {"description": "Not found"}},
)

# Dependency: Get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Get all history value sensors (อาจจะไม่จำเป็นถ้าใช้ WebSocket เป็นหลัก)
@router.get("/", response_model=list[schemas.HistoryValueSensorResponse])
def get_history_value_sensors(db: Session = Depends(get_db)):
    return crud.get_history_value_sensors(db) # ยังคงเรียก CRUD เดิมได้

# Get history value sensor by ID (อาจจะไม่จำเป็นถ้าใช้ WebSocket เป็นหลัก)
@router.get("/{history_value_sensor_id}", response_model=schemas.HistoryValueSensorResponse)
def get_history_value_sensor(history_value_sensor_id: int, db: Session = Depends(get_db)):
    return crud.get_history_value_sensor(history_value_sensor_id, db) # ยังคงเรียก CRUD เดิมได้

# แก้ไข route POST /
@router.post("/", response_model=schemas.HistoryValueSensorResponse)
def create_history_value_sensor_route(
    history_value_sensor: schemas.HistoryValueSensorCreate,
    db: Session = Depends(get_db)
):
    return crud.create_history_value_sensor(history_value_sensor=history_value_sensor, db=db)

# --- Endpoint อื่นๆ (Update, Delete, Get by Date) สามารถคงไว้ได้ ---
# Update history value sensor
@router.put("/{history_value_sensor_id}", response_model=schemas.HistoryValueSensorResponse)
def update_history_value_sensor(history_value_sensor_id: int, history_value_sensor: schemas.HistoryValueSensorCreate, db: Session = Depends(get_db)):
    # พิจารณา: ถ้าต้องการให้ข้อมูลที่อัปเดตถูก broadcast ด้วย ก็ต้องเพิ่ม BackgroundTasks ที่นี่ด้วย
    return crud.update_history_value_sensor(history_value_sensor_id, history_value_sensor, db)

# Delete history value sensor
@router.delete("/{history_value_sensor_id}")
def delete_history_value_sensor(history_value_sensor_id: int, db: Session = Depends(get_db)):
    return crud.delete_history_value_sensor(history_value_sensor_id, db)

# Get history by date (Endpoint นี้มีประโยชน์ ควรเก็บไว้)
@router.get("/history-value-sensor-date/{sensor_id}/{date_str}", response_model=List[schemas.HistoryValueSensorResponse])
def get_history_value_sensor_date(sensor_id: int, date_str: str, db: Session = Depends(get_db)):
    return crud.get_history_value_sensor_date(sensor_id, date_str, db)
