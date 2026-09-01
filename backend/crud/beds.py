from datetime import datetime, timezone
from typing import List, Optional
from fastapi import Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from models.base import get_db
from sqlalchemy.orm import Session, joinedload, contains_eager, subqueryload
from models.beds import Bed
from models.rooms import Room
from models.sensors import Sensor
from models.users import User
from schemas.beds import BedCreate, BedResponse
import json
from schemas.beds import BedUpdate
from app.auth import get_current_user
from fastapi import HTTPException, status

# Create bed
def create_bed(bed_create_data: BedCreate, db: Session = Depends(get_db)):
    existing = db.query(Bed).filter(
        Bed.room_id == bed_create_data.room_id,
        Bed.bed_name == bed_create_data.bed_name,
        Bed.deleted_at.is_(None)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bed name already exists in this room"
        )
    db_beds = Bed(**bed_create_data.model_dump())
    db.add(db_beds)
    db.commit()
    db.refresh(db_beds)
    return db_beds

# Read beds
def get_beds(db: Session = Depends(get_db)):
    beds = db.query(Bed).options(
        joinedload(Bed.room), 
        joinedload(Bed.patient),
        joinedload(Bed.sensors)
    ).filter(Bed.deleted_at.is_(None)).all()
    return beds

# Read bed
def get_bed(bed_id: int, db: Session = Depends(get_db)):
    bed = db.query(Bed).options(
        joinedload(Bed.room),
        joinedload(Bed.patient),
        joinedload(Bed.sensors).joinedload(Sensor.history_value_sensor)
    ).filter(Bed.bed_id == bed_id,Bed.deleted_at.is_(None)).first()
    if bed is None:
        raise HTTPException(status_code=404, detail="Bed not found")

    return bed

# Read activated beds
def get_bed_activated(db: Session, current_user: User) -> list[Bed]:

    query = (
        db.query(Bed)
        .options(
            joinedload(Bed.room).joinedload(Room.ward),
            joinedload(Bed.patient),
            joinedload(Bed.sensors),
        )
        .join(Bed.room)
        .filter(
            Bed.bed_activated == "1",
            Bed.deleted_at.is_(None),
        )
    )

    # เพิ่มเงื่อนไขการกรองตาม 'ward_id' หากผู้ใช้ไม่ได้เป็น Admin
    if current_user.ward_id is not None:
        query = query.filter(Room.ward_id == current_user.ward_id)

    # ดึงข้อมูลทั้งหมดจาก query ที่สร้างขึ้นและส่งคืนผลลัพธ์
    return query.all()

def get_bed_activated_paginated(
    db: Session,
    current_user: User,
    skip: int = 0,
    limit: Optional[int] = None
) -> List[Bed]:
    """
    ดึงข้อมูลเตียงที่เปิดใช้งานแบบแบ่งหน้า (Pagination)
    พร้อมทั้งกรองตามสิทธิ์การเข้าถึงของ User (Ward)
    """
    query = (
        db.query(Bed)
        .options(
            joinedload(Bed.room).joinedload(Room.ward),
            joinedload(Bed.patient),
            joinedload(Bed.sensors),
        )
        .join(Bed.room)
        .filter(
            Bed.bed_activated == "1",
            Bed.deleted_at.is_(None),
        )
    )

    # เพิ่มเงื่อนไขการกรองตาม 'ward_id' หากผู้ใช้ไม่ได้เป็น Admin
    if current_user.ward_id is not None:
        query = query.filter(Room.ward_id == current_user.ward_id)

    # --- ส่วนที่แก้ไขและเพิ่มเติม ---
    # 1. เรียงลำดับข้อมูลเพื่อให้การข้าม (skip) และจำกัด (limit) ได้ผลลัพธ์ที่แน่นอน
    query = query.order_by(Bed.bed_id)

    # 2. ใช้ offset และ limit สำหรับการทำ Pagination
    query = query.offset(skip)

    if limit is not None:
        query = query.limit(limit)
    # --- สิ้นสุดส่วนที่แก้ไข ---

    return query.all()

def count_bed_activated(db: Session, current_user: User) -> int:
    """
    นับจำนวนเตียงที่เปิดใช้งาน (Activated Beds)
    พร้อมทั้งกรองตามสิทธิ์การเข้าถึงของ User (Ward)
    """
    query = (
        db.query(Bed)
        .options(
            joinedload(Bed.room).joinedload(Room.ward),
            joinedload(Bed.patient),
            joinedload(Bed.sensors),
        )
        .join(Bed.room)
        .filter(
            Bed.bed_activated == "1",
            Bed.deleted_at.is_(None),
        )
    )

    # เพิ่มเงื่อนไขการกรองตาม 'ward_id' หากผู้ใช้ไม่ได้เป็น Admin
    if current_user.ward_id is not None:
        query = query.filter(Room.ward_id == current_user.ward_id)

    return query.count()

# Update bed
def update_bed(bed_id: int, bed: BedCreate, db: Session = Depends(get_db)):
    db_bed = db.query(Bed).filter(Bed.bed_id == bed_id).first()
    if db_bed is None:
        raise HTTPException(status_code=404, detail="Bed not found")

    # แปลงเป็น dict
    update_data = bed.model_dump()

    # 🔑 ลบ selectedShowSensorId ออก
    update_data.pop("selectedShowSensorId", None)

    # อัปเดต field อื่น ๆ ตามปกติ
    for key, value in update_data.items():
        setattr(db_bed, key, value)

    db.commit()
    db.refresh(db_bed)
    return db_bed


# Delete bed
def delete_bed(bed_id: int, db: Session = Depends(get_db)):
    db_bed = db.query(Bed).filter(Bed.bed_id == bed_id).first()
    if db_bed is None:
        raise HTTPException(status_code=404, detail="Bed not found")
    db.delete(db_bed)
    db.commit()
    return {"message": "Bed deleted"}


def patch_selected_show_sensor_id(bed_id: int, sensor_id: int, db: Session):
    bed = db.query(Bed).filter(Bed.bed_id == bed_id).first()

    if not bed:
        return None  # ถ้าไม่เจอ bed_id

    # ตรวจสอบว่า selectedShowSensorId เป็น Null หรือไม่
    if bed.selectedShowSensorId is None or bed.selectedShowSensorId == "":
        bed.selectedShowSensorId = json.dumps([sensor_id])  # เริ่มต้นที่ sensor_id เดียว
    else:
        # ถ้าใช้ SQLite → ใช้ String คั่นด้วย ","
        try:
            # พยายามแปลงเป็น list
            sensor_list = json.loads(bed.selectedShowSensorId)
            if not isinstance(sensor_list, list):  
                sensor_list = []
        except json.JSONDecodeError:
            sensor_list = []

        # แปลง sensor_id เป็น int และตรวจสอบซ้ำว่ามีแล้วหรือไม่
        if sensor_id not in sensor_list:
            sensor_list.append(sensor_id)

        # อัปเดต selectedShowSensorId ให้เป็น JSON string แต่แปลงเป็น list ที่ประกอบด้วยค่าตัวเลข
        bed.selectedShowSensorId = json.dumps(sensor_list)

    db.commit()
    db.refresh(bed)
    return bed



def patch_remove_show_sensor_id(bed_id: int, sensor_id: int, db: Session):
    bed = db.query(Bed).filter(Bed.bed_id == bed_id).first()
    if not bed:
        return None  # ถ้าไม่มี bed_id ในฐานข้อมูล ให้ return None

    # ตรวจสอบและแปลงค่า selectedShowSensorId เป็น list ของ int
    if bed.selectedShowSensorId:
        try:
            sensor_list = json.loads(bed.selectedShowSensorId)  # พยายามแปลงเป็น list
            if not isinstance(sensor_list, list):  
                sensor_list = []
        except json.JSONDecodeError:
            sensor_list = []
    else:
        sensor_list = []

    # แปลง sensor_id เป็น int เพื่อให้ตรงกับข้อมูลที่เก็บใน list
    sensor_list = [s for s in sensor_list if s != int(sensor_id)]  # ลบ sensor_id ที่ตรงกัน

    # อัปเดตค่าใหม่โดยแปลงเป็น JSON string
    bed.selectedShowSensorId = json.dumps(sensor_list) if sensor_list else None

    db.commit()
    db.refresh(bed)
    return bed



def patch_bed(bed_id: int, bed_data: BedUpdate, db: Session = Depends(get_db)):
    db_bed = db.query(Bed).filter(Bed.bed_id == bed_id).first()
    if not db_bed:
        raise HTTPException(status_code=404, detail="Bed not found")

    update_data = bed_data.model_dump(exclude_unset=True)
    print(update_data)

    if "patient_id" in update_data:
        db_bed.patient_id = update_data["patient_id"]
        db_bed.bed_activated = True if db_bed.patient_id not in (None, 0) else False

    if "bed_name" in update_data:
        db_bed.bed_name = update_data["bed_name"]

    if "room_id" in update_data:
        db_bed.room_id = update_data["room_id"]

    if "selectedShowSensorId" in update_data:
        db_bed.selectedShowSensorId = update_data["selectedShowSensorId"]

    if "sensors" in update_data:
        # 1) ล้าง sensors เดิม
        for origin_sensor in db_bed.sensors:
            origin_sensor.bed_id = None

        db_bed.sensors.clear()  # clear ความสัมพันธ์ ORM ด้วย

        # 2) เพิ่ม sensors ใหม่
        for item_sensor in update_data["sensors"]:
            sensor = db.query(Sensor).filter(Sensor.sensor_id == item_sensor["sensor_id"]).first()
            if sensor:
                sensor.bed_id = bed_id
                db_bed.sensors.append(sensor)

    db.commit()
    db.refresh(db_bed)
    return db_bed

def remove_patient_from_bed(bed_id: int, patient_id: int, db: Session = Depends(get_db)):
    # ค้นหาเตียงที่ต้องการลบการเชื่อมโยง
    bed = db.query(Bed).filter(Bed.bed_id == bed_id).first()

    if not bed:
        raise HTTPException(status_code=404, detail="Bed not found")

    # ตรวจสอบว่าเตียงนี้เชื่อมโยงกับ patient_id ที่ส่งมาหรือไม่
    if bed.patient_id != patient_id:
        raise HTTPException(status_code=400, detail="This bed is not assigned to the given patient")

    # ตั้งค่า patient_id เป็น NULL
    bed.patient_id = None
    db.commit()
    
    return {"message": f"Patient {patient_id} removed from bed {bed_id} successfully"}

def loadSensorNotificationConfig(bed_id: int, db: Session = Depends(get_db)):
    bed = db.query(Bed).filter(Bed.bed_id == bed_id).first()
    if bed is None:
        raise HTTPException(status_code=404, detail="Bed not found")

    return bed


def get_bed_free(db: Session = Depends(get_db)):
    beds = db.query(Bed).options(
        joinedload(Bed.room), 
        joinedload(Bed.patient),
        joinedload(Bed.sensors).joinedload(Sensor.history_value_sensor)
    ).filter(
        Bed.bed_activated == "0",
        Bed.deleted_at.is_(None)     
             ).all()

    for bed in beds:
        for sensor in bed.sensors:
            if sensor.history_value_sensor:
                sensor.history_value_sensor = [max(sensor.history_value_sensor, key=lambda x: x.history_value_sensor_id)]

    if beds is None:
        raise HTTPException(status_code=404, detail="Beds not found")
    return beds


# Soft Delete bed
def softdelete_bed(bed_id: int, db: Session = Depends(get_db)) -> dict:
    db_bed_model = db.query(Bed).filter(
        Bed.bed_id == bed_id,
        Bed.deleted_at.is_(None) 
    ).first()
    if db_bed_model is None:
        raise HTTPException(status_code=404, detail=f"Bed with id {bed_id} not found or already deleted")
    

    db_bed_model.deleted_at = datetime.now(timezone.utc)
    
    if db_bed_model.patient_id is not None:
        # คุณอาจจะต้องการ log หรือแจ้งเตือนว่าผู้ป่วยคนนี้ไม่มีเตียงแล้ว
        print(f"INFO: Patient {db_bed_model.patient_id} is being unassigned from soft-deleted bed {bed_id}.")
        db_bed_model.patient_id = None
        

    db.commit()
    return {"message": f"Bed with id {bed_id} marked as deleted successfully"}


def get_bed_free_ward(db: Session, current_user: User) -> list[Bed]:

    query = (
        db.query(Bed)
        .options(
            joinedload(Bed.room).joinedload(Room.ward),
            joinedload(Bed.patient),
            joinedload(Bed.sensors),
        )
        .join(Bed.room)
        .filter(
            Bed.bed_activated == "0",
            Bed.deleted_at.is_(None),
        )
    )

    # เพิ่มเงื่อนไขการกรองตาม 'ward_id' หากผู้ใช้ไม่ได้เป็น Admin
    if current_user.ward_id is not None:
        query = query.filter(Room.ward_id == current_user.ward_id)

    # ดึงข้อมูลทั้งหมดจาก query ที่สร้างขึ้นและส่งคืนผลลัพธ์
    return query.all()


