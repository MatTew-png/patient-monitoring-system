import json
from typing import List
from fastapi import Depends, HTTPException
from models.base import get_db
from sqlalchemy.orm import Session, joinedload
from models.beds import Bed
from models.sensor_notifications_config import Sensor_Notifications_Config
from schemas.sensor_notifications_config import SensorNotificationsConfigBase, SensorNotificationsConfigCreate, SensorNotificationsConfigResponse
from schemas.sensors import SensorResponse

# Create sensor notifications config
def create_sensor_notifications_config(sensor_notifications_config: SensorNotificationsConfigCreate, db: Session = Depends(get_db)):
    db_sensor_notifications_configs = Sensor_Notifications_Config(**sensor_notifications_config.model_dump())
    db.add(db_sensor_notifications_configs)
    db.commit()
    db.refresh(db_sensor_notifications_configs)
    return db_sensor_notifications_configs

# Read sensor notifications configs
def get_sensor_notifications_configs(db: Session = Depends(get_db)):
    sensor_notifications_configs = db.query(Sensor_Notifications_Config).options(
        joinedload(Sensor_Notifications_Config.sensor)
    ).all()
    return sensor_notifications_configs

# Read a single sensor notifications config
def get_sensor_notifications_config(sensor_notifications_config_id: int, db: Session = Depends(get_db)):
    sensor_notifications_config = db.query(Sensor_Notifications_Config).filter(Sensor_Notifications_Config.sensor_notifications_config_id == sensor_notifications_config_id).options(
        joinedload(Sensor_Notifications_Config.sensor)
    ).first()
    if sensor_notifications_config is None:
        raise HTTPException(status_code=404, detail="Sensor notifications config not found")
    return sensor_notifications_config

# Update sensor notifications config
def update_sensor_notifications_config(sensor_id: int, sensor_notifications_config_id: int, sensor_notifications_config: SensorNotificationsConfigCreate, db: Session = Depends(get_db)):
    db_sensor_notifications_config = db.query(Sensor_Notifications_Config).filter(Sensor_Notifications_Config.sensor_id == sensor_id, 
                                                                                   Sensor_Notifications_Config.sensor_notifications_config_id == sensor_notifications_config_id).first()
    
    # if not db_sensor_notifications_configs:
    #     raise HTTPException(status_code=404, detail="Sensor notifications config not found")
    
    # # แก้ไขข้อมูลทีละตัว
    # for config in sensor_notifications_config:
    #     # หาค่าที่ตรงกับ sensor_notifications_config_id จากข้อมูลที่รับมาจาก frontend
    #     db_config = next((item for item in db_sensor_notifications_configs if item.sensor_notifications_config_id == config.sensor_notifications_config_id), None)
        
    #     if db_config:
    #         # อัปเดตค่าภายใน database ด้วยค่าที่ได้รับจาก frontend
    #         db_config.sensor_notifications_config_event = config.sensor_notifications_config_event
    #         db_config.sensor_notifications_config_usage = config.sensor_notifications_config_usage
    #         db_config.sensor_notifications_config_repeatnoti = config.sensor_notifications_config_repeatnoti
    #         db_config.sensor_notifications_config_rangetime = config.sensor_notifications_config_rangetime
    #         db_config.sensor_notifications_config_signal = config.sensor_notifications_config_signal

    #         db.commit()  # คอมมิตการเปลี่ยนแปลง
    #         db.refresh(db_config)  # รีเฟรชข้อมูลเพื่อให้ค่าที่อัปเดตถูกต้อง
    #     else:
    #         # ถ้าหากไม่พบข้อมูลใน database ให้โยนข้อผิดพลาด
    #         raise HTTPException(status_code=404, detail=f"Config with ID {config.sensor_notifications_config_id} not found")

    # return {"message": "Sensor notifications configurations updated successfully"}

    if db_sensor_notifications_config is None:
        raise HTTPException(status_code=404, detail="Sensor notifications config not found")
    for key, value in sensor_notifications_config.model_dump().items():
        setattr(db_sensor_notifications_config, key, value)
    db.commit()
    db.refresh(db_sensor_notifications_config)
    return db_sensor_notifications_config

# Delete sensor notifications config
def delete_sensor_notifications_config(sensor_notifications_config_id: int, db: Session = Depends(get_db)):
    db_sensor_notifications_config = db.query(Sensor_Notifications_Config).filter(Sensor_Notifications_Config.sensor_notifications_config_id == sensor_notifications_config_id).first()
    if db_sensor_notifications_config is None:
        raise HTTPException(status_code=404, detail="Sensor notifications config not found")
    db.delete(db_sensor_notifications_config)
    db.commit()
    return {"message": "Sensor notifications config deleted"}


def get_sensor_notifications_config(bed_id: int, db: Session = Depends(get_db)):
    bed = db.query(Bed).filter(Bed.bed_id == bed_id).first()
    if not bed:
        raise HTTPException(status_code=404, detail="Bed not found")

    selected_sensor_ids = bed.selectedShowSensorId
    if not selected_sensor_ids:
        raise HTTPException(status_code=404, detail="No sensor IDs selected for this bed")

    try:
        if isinstance(selected_sensor_ids, str):
            selected_sensor_ids = selected_sensor_ids.replace("[", "").replace("]", "")  # ลบ [ ] ออก
            sensor_ids_int = [int(i.strip()) for i in selected_sensor_ids.split(",") if i.strip().isdigit()]
        else:
            sensor_ids_int = json.loads(selected_sensor_ids)
    except (ValueError, TypeError, json.JSONDecodeError):
        raise HTTPException(status_code=400, detail="Invalid sensor ID format in selectedShowSensorId")

    sensor_configs = db.query(Sensor_Notifications_Config).filter(
        Sensor_Notifications_Config.sensor_id.in_(sensor_ids_int)
    ).all()

    response_data = []
    for config in sensor_configs:
        sensor_data = None
        if hasattr(config, 'sensor') and config.sensor:
            sensor_data = SensorResponse.model_validate(config.sensor.__dict__)

        response_data.append(
            SensorNotificationsConfigResponse.model_validate({**config.__dict__, "sensor": sensor_data})
        )

    return response_data



def patch_sensor_notifications_config(bed_id: int, update_data: List[dict], db: Session):
    bed = db.query(Bed).filter(Bed.bed_id == bed_id).first()
    if not bed:
        raise HTTPException(status_code=404, detail="Bed not found")

    selected_sensor_ids = bed.selectedShowSensorId
    if not selected_sensor_ids:
        raise HTTPException(status_code=404, detail="No sensor IDs selected for this bed")

    try:
        if isinstance(selected_sensor_ids, str):
            selected_sensor_ids = selected_sensor_ids.replace("[", "").replace("]", "")
            sensor_ids_int = [int(i.strip()) for i in selected_sensor_ids.split(",") if i.strip().isdigit()]
        else:
            sensor_ids_int = json.loads(selected_sensor_ids)
    except (ValueError, TypeError, json.JSONDecodeError):
        raise HTTPException(status_code=400, detail="Invalid sensor ID format in selectedShowSensorId")

    # ดึง `sensor_notifications_config` ตาม `sensor_id`
    sensor_configs = db.query(Sensor_Notifications_Config).filter(
        Sensor_Notifications_Config.sensor_id.in_(sensor_ids_int)
    ).all()

    if not sensor_configs:
        raise HTTPException(status_code=404, detail="No sensor configurations found for the given bed")

    # อัปเดตค่าตาม `update_data`
    for update in update_data:
        sensor_id = update.get("sensor_id")
        if sensor_id not in sensor_ids_int:
            raise HTTPException(status_code=400, detail=f"Sensor ID {sensor_id} is not associated with this bed.")

        sensor_config = next((config for config in sensor_configs if config.sensor_id == sensor_id), None)
        if not sensor_config:
            continue  # ข้ามถ้าไม่มี sensor_id ตรงกัน

        for key, value in update.items():
            if key != "sensor_id":  # ไม่อัปเดต sensor_id
                setattr(sensor_config, key, value)

    db.commit()

    # ✅ ใช้ model_validate() เพื่อแปลง SQLAlchemy Object เป็น Pydantic Model
    return [SensorNotificationsConfigResponse.model_validate(config, from_attributes=True) for config in sensor_configs]




