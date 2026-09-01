# crud/history_value_sensor.py
from datetime import date, datetime
from fastapi import Depends, HTTPException, BackgroundTasks # <<< เพิ่ม BackgroundTasks
# from models.base import get_db # เอา get_db ออกจาก signature ถ้าไม่จำเป็นต้องเรียกตรงๆ
from sqlalchemy.orm import Session
from models.history_value_sensor import History_Value_Sensor
from schemas.history_value_sensor import HistoryValueSensorCreate, HistoryValueSensorResponse
from app.websocket_manager import manager # <<< Import a manager instance

# Helper function สำหรับแปลง SQLAlchemy object เป็น dict ที่ส่งผ่าน JSON ได้
def history_to_dict(history: History_Value_Sensor) -> dict:
    """Converts History_Value_Sensor model instance to a dictionary."""
    return {
        "history_value_sensor_id": history.history_value_sensor_id,
        "sensor_id": history.sensor_id,
        "history_value_sensor_value": history.history_value_sensor_value,
        # แปลง datetime เป็น ISO format string
        "history_value_sensor_time": history.history_value_sensor_time.isoformat()
    }

# Create history value sensor (รับ BackgroundTasks เพิ่ม)
def create_history_value_sensor(
    history_value_sensor: HistoryValueSensorCreate,
    background_tasks: BackgroundTasks, # <<< รับ parameter นี้
    db: Session # <<< รับ db session จาก route โดยตรง
):
    """Creates a new history value sensor record and broadcasts it via WebSocket."""
    try:
        db_sensor_values = History_Value_Sensor(**history_value_sensor.model_dump())
        db.add(db_sensor_values)
        db.commit()
        db.refresh(db_sensor_values)
    except Exception as e:
         db.rollback() # Rollback ถ้ามีปัญหาในการบันทึก
         print(f"Error saving history value sensor to DB: {e}")
         # อาจจะ raise HTTPException หรือ return error response ที่เหมาะสม
         raise HTTPException(status_code=500, detail="Failed to save sensor data.")

    # หลังจากบันทึกสำเร็จ ให้ broadcast ข้อมูลผ่าน WebSocket เป็น Background Task
    try:
        data_dict = history_to_dict(db_sensor_values)
        sensor_id_str = str(db_sensor_values.sensor_id)
        # เพิ่ม task ให้ FastAPI จัดการรัน broadcast_json ใน background
        background_tasks.add_task(manager.broadcast_json, data_dict, sensor_id_str)
        print(f"Background task added to broadcast for sensor {sensor_id_str}")

    except Exception as e:
        # การ broadcast ล้มเหลวไม่ควรทำให้ request หลักพัง แต่ควร log ไว้
        print(f"Error adding background task for WebSocket broadcast: {e}")

    return db_sensor_values # คืนค่า object ที่สร้างสำเร็จ

# --- ฟังก์ชัน CRUD อื่นๆ (get, update, delete, get_by_date) ---
# ไม่จำเป็นต้องแก้ไขฟังก์ชันเหล่านี้ เว้นแต่ต้องการ broadcast ตอน update ด้วย

def get_history_value_sensors(db: Session):
    history_value_sensors = db.query(History_Value_Sensor).options(
        # joinedload(History_Value_Sensor.sensor) # อาจจะไม่จำเป็นต้อง load sensor แล้ว
    ).all()
    return history_value_sensors

def get_history_value_sensor(history_value_sensor_id: int, db: Session):
    history_value_sensor = db.query(History_Value_Sensor).filter(History_Value_Sensor.history_value_sensor_id == history_value_sensor_id).options(
        # joinedload(History_Value_Sensor.sensor) # อาจจะไม่จำเป็นต้อง load sensor แล้ว
    ).first()
    if history_value_sensor is None:
        raise HTTPException(status_code=404, detail="History value sensor not found")
    return history_value_sensor

def update_history_value_sensor(history_value_sensor_id: int, history_value_sensor: HistoryValueSensorCreate, db: Session):
    db_history_value_sensor = db.query(History_Value_Sensor).filter(History_Value_Sensor.history_value_sensor_id == history_value_sensor_id).first()
    if db_history_value_sensor is None:
        raise HTTPException(status_code=404, detail="History value sensor not found")
    for key, value in history_value_sensor.model_dump(exclude_unset=True).items(): # ใช้ exclude_unset
        setattr(db_history_value_sensor, key, value)
    try:
        db.commit()
        db.refresh(db_history_value_sensor)
        # พิจารณา: ถ้าต้องการ broadcast ข้อมูลที่อัปเดต ให้เพิ่ม Background Task ที่นี่
        # data_dict = history_to_dict(db_history_value_sensor)
        # background_tasks.add_task(manager.broadcast_json, data_dict, str(db_history_value_sensor.sensor_id))
    except Exception as e:
         db.rollback()
         print(f"Error updating history value sensor: {e}")
         raise HTTPException(status_code=500, detail="Failed to update sensor data.")

    return db_history_value_sensor

def delete_history_value_sensor(history_value_sensor_id: int, db: Session):
    db_history_value_sensor = db.query(History_Value_Sensor).filter(History_Value_Sensor.history_value_sensor_id == history_value_sensor_id).first()
    if db_history_value_sensor is None:
        raise HTTPException(status_code=404, detail="History value sensor not found")
    try:
        db.delete(db_history_value_sensor)
        db.commit()
    except Exception as e:
         db.rollback()
         print(f"Error deleting history value sensor: {e}")
         raise HTTPException(status_code=500, detail="Failed to delete sensor data.")
    return {"message": "History value sensor deleted"}

def get_history_value_sensor_date(sensor_id: int, date_str: str, db: Session):
    try:
        target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    start_time = datetime.combine(target_date, datetime.min.time())
    end_time = datetime.combine(target_date, datetime.max.time())

    history_values = db.query(History_Value_Sensor).filter(
        History_Value_Sensor.sensor_id == sensor_id,
        History_Value_Sensor.history_value_sensor_time >= start_time,
        History_Value_Sensor.history_value_sensor_time <= end_time
    ).order_by(History_Value_Sensor.history_value_sensor_time).all() # เรียงตามเวลาด้วยก็ได้

    # ไม่ต้อง raise 404 ถ้าไม่เจอข้อมูลสำหรับวันนั้นๆ คืนค่า list ว่างไปแทน
    # if not history_values:
    #     raise HTTPException(status_code=404, detail="No history values found for the given sensor on the specified date")

    # ใช้ model_validate หรือ history_to_dict เพื่อแปลงข้อมูลก่อนส่งกลับ
    return [history_to_dict(history) for history in history_values]
    # หรือถ้า Schema ถูกต้องแล้ว:
    # return [HistoryValueSensorResponse.model_validate(history, from_attributes=True) for history in history_values]

def insert_sensor_value(db: Session, sensor_id: int, value: float, timestamp: datetime):
    new_record = History_Value_Sensor(
        sensor_id=sensor_id,
        history_value_sensor_value=value,
        history_value_sensor_time=timestamp
    )
    try:
        db.add(new_record)
        db.commit()
        db.refresh(new_record)
        return new_record
    except Exception as e:
        db.rollback()
        print(f"Error inserting sensor value: {e}")
        raise