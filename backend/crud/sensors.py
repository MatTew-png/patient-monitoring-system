from Mock import Floor, Room
from typing import List, Optional
from fastapi import Depends, HTTPException
from models.base import get_db
from models.buildings import Building
from models.floors import Floor
from models.history_value_sensor import History_Value_Sensor
from models.rooms import Room
from models.sensor_notifications_config import Sensor_Notifications_Config
from sqlalchemy.orm import Session, joinedload, noload,with_loader_criteria
from models.beds import Bed
from models.sensors import Sensor
from schemas.sensors import SensorCreate,SensorWithConfigResponse
from crud.beds import patch_remove_show_sensor_id
from schemas.sensor_notifications_config import SensorNotificationsConfigResponse
from datetime import datetime, timezone
import json

# Create sensor
def create_sensor(sensor: SensorCreate, db: Session = Depends(get_db)):
    db_sensors = Sensor(**sensor.model_dump())
    db.add(db_sensors)
    db.commit()
    db.refresh(db_sensors)
    return db_sensors

# Read sensors
def get_sensors(db: Session = Depends(get_db)) -> List[Sensor]: # เพิ่ม Type Hint
    print("DEBUG: crud.get_sensors called") # เพิ่ม log
    sensors = db.query(Sensor).options(
           joinedload(Sensor.bed)
        .joinedload(Bed.room)
    ).filter(
        Sensor.deleted_at == None # <<< เพิ่ม filter นี้
    ).all()
    print(f"DEBUG: crud.get_sensors found {len(sensors)} sensors") # เพิ่ม log
    return sensors

# Read sensor
def get_sensor(sensor_id: int, db: Session = Depends(get_db)) -> Optional[Sensor]: # เพิ่ม Type Hint
    print(f"DEBUG: crud.get_sensor called for sensor_id: {sensor_id}") # เพิ่ม log
    sensor = db.query(Sensor).options(
        joinedload(Sensor.bed)
            .joinedload(Bed.room)
            .joinedload(Room.floor)
            .joinedload(Floor.building)
    ).filter(
        Sensor.sensor_id == sensor_id,
        Sensor.deleted_at == None  # เงื่อนไขกรอง soft delete
    ).first()
    print(f"DEBUG: Sensor found in DB: {sensor.sensor_id if sensor else 'None'}") # เพิ่ม log
    # ไม่ควร raise HTTPException จาก CRUD function โดยตรง ปล่อยให้ route จัดการ
    # if sensor is None:
    #     raise HTTPException(status_code=404, detail="Sensor not found or has been deleted")
    return sensor

# Update sensor
def update_sensor(sensor_id: int, sensor: SensorCreate, db: Session = Depends(get_db)):
    db_sensor = db.query(Sensor).filter(Sensor.sensor_id == sensor_id).first()
    if db_sensor is None:
        raise HTTPException(status_code=404, detail="Sensor not found")
    for key, value in sensor.model_dump().items():
        setattr(db_sensor, key, value)
    db.commit()
    db.refresh(db_sensor)
    return db_sensor

# Delete sensor (Soft Delete)
def delete_sensor(sensor_id: int, db: Session = Depends(get_db)):
    # ดึงข้อมูล sensor ที่ยังไม่ถูกลบ
    db_sensor = db.query(Sensor).filter(
        Sensor.sensor_id == sensor_id,
        Sensor.deleted_at == None # <<< กรองเฉพาะที่ยังไม่ลบ
    ).first()

    if db_sensor is None:
        raise HTTPException(status_code=404, detail="Sensor not found or already deleted")

    # ตั้งค่า deleted_at เป็นเวลาปัจจุบัน
    db_sensor.deleted_at = datetime.now(timezone.utc)

    # อาจจะต้องจัดการ relationships เพิ่มเติม เช่น ยกเลิก config
    # for config in db_sensor.sensor_notifications_config:
    #     config.deleted_at = datetime.utcnow() # ถ้า config ต้อง soft delete ตาม

    try:
        db.commit()
        # ไม่ต้อง refresh เพราะเราไม่ได้ต้องการข้อมูลที่เพิ่งอัปเดตกลับไป
        return {"message": "Sensor marked as deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Could not mark sensor as deleted: {str(e)}")


def get_all_sensors_free(db: Session = Depends(get_db)):
    db_bed = (
        db.query(Sensor)
        .select_from(Sensor)  # Explicitly select the source table for join
        .outerjoin(Bed, Sensor.bed_id == Bed.bed_id)  # Explicit ON condition for the join
        .filter(
            Sensor.bed_id == None,
            Sensor.deleted_at == None,
            Sensor.sensor_status == 1
            )  # Make sure to filter correctly
        .all()
    )

    if not db_bed:
        raise HTTPException(status_code=404, detail="No Sensor found without beds")

    return db_bed

# Get sensor with the latest history value
def get_value_sensor(sensor_id: int, db: Session = Depends(get_db)):
    sensor = db.query(Sensor).options(
        joinedload(Sensor.bed)
    ).filter(
        Sensor.sensor_id == sensor_id,
        Sensor.deleted_at == None
        ).first()

    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")

    if sensor.history_value_sensor:
        sensor.history_value_sensor = [max(sensor.history_value_sensor, key=lambda x: x.history_value_sensor_id)]

    return sensor

def update_sensor(sensor_id: int, sensor_update: SensorCreate, db: Session = Depends(get_db)):
    db_sensor = db.query(Sensor).filter(Sensor.sensor_id == sensor_id).first()
    if not db_sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")

    # Update the fields if they are provided in the request
    for key, value in sensor_update.model_dump(exclude_unset=True).items():
        setattr(db_sensor, key, value)

    db.commit()
    db.refresh(db_sensor)
    return db_sensor

def remove_sensor_from_bed(sensor_id:int,bed_id:int,db:Session=Depends(get_db)):
    db_sensor = db.query(Sensor).filter(Sensor.sensor_id == sensor_id).first()
    db_sensor.bed_id = None
    patch_remove_show_sensor_id(bed_id,sensor_id,db)
    db.commit()
    db.refresh(db_sensor)
    return db_sensor

def patchSensorNotificationConfig(sensor_id: int, sensor_data: SensorWithConfigResponse, db: Session):
    # ค้นหา Sensor จากฐานข้อมูล
    db_sensor = db.query(Sensor).filter(Sensor.sensor_id == sensor_id).first()
    
    if not db_sensor:
        return None  # หรือจะโยน HTTPException(404, "Sensor not found") ก็ได้
    
    # ดึง sensor_notifications_config ที่มีอยู่ในฐานข้อมูล
    existing_configs = {config.sensor_notifications_config_id: config for config in db_sensor.sensor_notifications_config}

    # เก็บค่าที่จะอัปเดต
    new_configs = sensor_data.sensor_notifications_config or []

    # อัปเดต / เพิ่ม / ลบ ค่าใน sensor_notifications_config
    updated_config_ids = set()
    
    for new_config in new_configs:
        if new_config.sensor_notifications_config_id and new_config.sensor_notifications_config_id in existing_configs:
            # กรณีอัปเดตค่าเดิม
            db_config = existing_configs[new_config.sensor_notifications_config_id]
            db_config.sensor_notifications_config_event = new_config.sensor_notifications_config_event
            db_config.sensor_notifications_config_usage = new_config.sensor_notifications_config_usage
            db_config.sensor_notifications_config_repeatnoti = new_config.sensor_notifications_config_repeatnoti
            db_config.sensor_notifications_config_rangetime = new_config.sensor_notifications_config_rangetime
            db_config.sensor_notifications_config_signal = new_config.sensor_notifications_config_signal
            updated_config_ids.add(new_config.sensor_notifications_config_id)
        else:
            # กรณีเพิ่มค่าใหม่
            new_db_config = Sensor_Notifications_Config(
                sensor_id=sensor_id,
                sensor_notifications_config_event=new_config.sensor_notifications_config_event,
                sensor_notifications_config_usage=new_config.sensor_notifications_config_usage,
                sensor_notifications_config_repeatnoti=new_config.sensor_notifications_config_repeatnoti,
                sensor_notifications_config_rangetime=new_config.sensor_notifications_config_rangetime,
                sensor_notifications_config_signal=new_config.sensor_notifications_config_signal
            )
            db.add(new_db_config)
    
    # ลบค่าที่ไม่ได้อยู่ในรายการใหม่
    for config_id, config in existing_configs.items():
        if config_id not in updated_config_ids:
            db.delete(config)

    # Commit การเปลี่ยนแปลง
    db.commit()
    db.refresh(db_sensor)  # รีเฟรชข้อมูลใหม่จากฐานข้อมูล
    
    return db_sensor

history_map_sensor_value_Global= {}

def update_history(history_obj):
    global history_map_sensor_value_Global
    # แปลง object SQLAlchemy -> dict (ตัด _sa_instance_state ออก)
    data = {k: v for k, v in history_obj.__dict__.items() if k != "_sa_instance_state"}
    sensor_id = data["sensor_id"]

    # ถ้า sensor_id ซ้ำ → ค่าใหม่จะทับค่าเก่า
    history_map_sensor_value_Global[sensor_id] = data

from sqlalchemy import func


def getSensorAllValueOneTime(db: Session, data: dict):
    # print(history_map_sensor_value_Global)

    sensors_id = data["sensors_id"]

    # ดึง sensors ทั้งหมดทีเดียว
    sensors = db.query(Sensor).filter(
        Sensor.sensor_id.in_(sensors_id),
        Sensor.deleted_at == None
    ).all()

    # ดึงค่า history ล่าสุดทั้งหมด (query เดียว)
    history_subquery = db.query(
        History_Value_Sensor.sensor_id,
        History_Value_Sensor.history_value_sensor_id
    ).filter(
        History_Value_Sensor.sensor_id.in_(sensors_id)
    ).order_by(
        History_Value_Sensor.sensor_id,
        History_Value_Sensor.history_value_sensor_id.desc()
    ).distinct(History_Value_Sensor.sensor_id).subquery()

    latest_ids_subquery = (
    db.query(
        History_Value_Sensor.sensor_id,
        func.max(History_Value_Sensor.history_value_sensor_id).label("max_id")
    )
    .filter(History_Value_Sensor.sensor_id.in_(sensors_id))
    .group_by(History_Value_Sensor.sensor_id)
    .subquery()
    )

# 🔹 join เพื่อดึง record ที่ตรงกับ max_id
    latest_histories = (
        db.query(History_Value_Sensor)
        .join(
            latest_ids_subquery,
            (History_Value_Sensor.sensor_id == latest_ids_subquery.c.sensor_id)
            & (History_Value_Sensor.history_value_sensor_id == latest_ids_subquery.c.max_id)
        )
        .all()
    )

    # 🔹 แมป sensor_id -> history จาก DB
    history_map = {h.sensor_id: h for h in latest_histories}

    # 🔹 ทับด้วยค่า Global ถ้ามี sensor_id ซ้ำ
    for sensor_id, data in history_map_sensor_value_Global.items():
        if sensor_id in sensors_id:  # ใช้เฉพาะที่อยู่ใน request
            history_map[sensor_id] = data  

    # เตรียม dict: bed_id -> list of sensors
    bed_sensors_map = {}
    # print('map')
    # print(history_map.__dict__)

    for sensor in sensors:
        sensor_dict = {
            "sensor_id": sensor.sensor_id,
            "bed_id": sensor.bed_id,
            "sensor_status": sensor.sensor_status,
            "sensor_mac_ii": sensor.sensor_mac_ii,
            "sensor_name": sensor.sensor_name,
            "sensor_type": sensor.sensor_type,
            "sensor_mac_i": sensor.sensor_mac_i,
            "sensor_unit": sensor.sensor_unit,
            "deleted_at": sensor.deleted_at,
            # 🔹 แปลงค่าให้เหมือนกัน (global อาจเป็น dict, DB เป็น obj)
            "history_value_sensor": [
                history_map[sensor.sensor_id]
            ] if sensor.sensor_id in history_map else []
        }
        bed_sensors_map.setdefault(sensor.bed_id, []).append(sensor_dict)

    # ดึง bed ที่เกี่ยวข้อง
    beds = (
        db.query(Bed)
        .options(joinedload(Bed.room), joinedload(Bed.patient))
        .filter(Bed.bed_id.in_(bed_sensors_map.keys()))
        .all()
    )
    response_data = []

    for bed in beds:
        bed_dict = bed.__dict__.copy()
        try:
            bed_dict["selectedShowSensorId"] = json.loads(bed.selectedShowSensorId)
        except Exception:
            bed_dict["selectedShowSensorId"] = []

        bed_dict["sensors"] = bed_sensors_map.get(bed.bed_id, [])
        response_data.append(bed_dict)

    return response_data

def get_sensor_by_mac_i(sensor_mac_i: str, db: Session = Depends(get_db)) -> Optional[int]:
    # print(f"DEBUG: crud.get_sensor_by_mac_i called for sensor_mac_i: {sensor_mac_i}")
    sensor = db.query(Sensor).filter(
        Sensor.sensor_mac_i == sensor_mac_i,
        Sensor.deleted_at == None
    ).first()
    # print(f"DEBUG: Sensor found in DB: {sensor.sensor_id if sensor else 'None'}")
    return sensor.sensor_id if sensor else None


def get_sensor_by_mac_i_and_ii(sensor_mac_i: str, sensor_mac_ii: str, db: Session = Depends(get_db)) -> Optional[int]:
    # print(f"DEBUG: crud.get_sensor_by_mac_i_and_ii called for sensor_mac_i: {sensor_mac_i}, sensor_mac_ii: {sensor_mac_ii}")
    sensor = db.query(Sensor).filter(
        Sensor.sensor_mac_i == sensor_mac_i,
        Sensor.sensor_mac_ii == sensor_mac_ii,
        Sensor.deleted_at == None
    ).first()
    # print(f"DEBUG: Sensor found in DB: {sensor.sensor_id if sensor else 'None'}")
    return sensor.sensor_id if sensor else None
    
    










