from fastapi import Depends, HTTPException
from models.base import get_db
from sqlalchemy.orm import Session, joinedload

from models.log_bed_patient_sensor import Log_Bed_Patient_Sensor
from schemas.log_bed_patient_sensor import LogBedPatientSensorCreate

# Create log bed patient sensor
def create_log_bed_patient_sensor(log_bed_patient_sensor: LogBedPatientSensorCreate, db: Session = Depends(get_db)):
    db_log_bed_patient_sensor = Log_Bed_Patient_Sensor(**log_bed_patient_sensor.model_dump())
    db.add(db_log_bed_patient_sensor)
    db.commit()
    db.refresh(db_log_bed_patient_sensor)
    return db_log_bed_patient_sensor

# Read log bed patient sensor
def get_log_bed_patient_sensors(db: Session = Depends(get_db)):
    logs_bed_patient_sensor_data = db.query(Log_Bed_Patient_Sensor).all()
    return logs_bed_patient_sensor_data

# Read a single log bed patient sensor
def get_log_bed_patient_sensor(log_bed_patient_sensor_id: int, db: Session = Depends(get_db)):
    log_bed_patient_sensor_data = db.query(Log_Bed_Patient_Sensor).filter(
        Log_Bed_Patient_Sensor.log_bed_patient_sensor_id == log_bed_patient_sensor_id
    ).first()
    if log_bed_patient_sensor_data is None:
        raise HTTPException(status_code=404, detail="Log bed patient sensor not found")
    return log_bed_patient_sensor_data

# Update log bed patient sensor
def update_log_bed_patient_sensor(log_bed_patient_sensor_id: int, log_bed_patient_sensor: LogBedPatientSensorCreate, db: Session = Depends(get_db)):
    db_log_bed_patient_sensor = db.query(Log_Bed_Patient_Sensor).filter(Log_Bed_Patient_Sensor.log_bed_patient_sensor_id == log_bed_patient_sensor_id).first()
    if db_log_bed_patient_sensor is None:
        raise HTTPException(status_code=404, detail="Log bed patient sensor not found")
    for key, value in log_bed_patient_sensor.model_dump().items():
        setattr(db_log_bed_patient_sensor, key, value)
    db.commit()
    db.refresh(db_log_bed_patient_sensor)
    return db_log_bed_patient_sensor

# Delete log bed patient sensor
def delete_log_bed_patient_sensor(log_bed_patient_sensor_id: int, db: Session = Depends(get_db)):
    db_log_bed_patient_sensor = db.query(Log_Bed_Patient_Sensor).filter(Log_Bed_Patient_Sensor.log_bed_patient_sensor_id == log_bed_patient_sensor_id).first()
    if db_log_bed_patient_sensor is None:
        raise HTTPException(status_code=404, detail="Log bed patient sensor not found")
    db.delete(db_log_bed_patient_sensor)
    db.commit()
    return {"message": "Log bed patient sensor deleted"}

def get_log_notifications_by_bed_and_patient(bed_id: int, patient_id: int, db: Session = Depends(get_db)):
    log_bed_patient_sensor_data = db.query(Log_Bed_Patient_Sensor).filter(
        Log_Bed_Patient_Sensor.bed_id == bed_id,
        Log_Bed_Patient_Sensor.patient_id == patient_id
    ).all()  # ใช้ all() เพื่อดึงข้อมูลทั้งหมดที่ตรงกับเงื่อนไข
    
    if not log_bed_patient_sensor_data:
        raise HTTPException(status_code=404, detail="Log bed patient sensor not found")

    # Return all the log data with the related notifications
    return log_bed_patient_sensor_data


