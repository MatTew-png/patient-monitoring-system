from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import log_bed_patient_sensor as models
from schemas import log_bed_patient_sensor as schemas
from models.base import SessionLocal
from models.base import engine, Base, get_db
import crud.log_bed_patient_sensor as crud

router = APIRouter(
    prefix="/log_bed_patient_sensor",
    tags=["log_bed_patient_sensor"],
    responses={404: {"description": "Not found"}},
)

# Dependency: Get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Get all log bed patient sensor
@router.get("/", response_model=list[schemas.LogBedPatientSensorResponse])
def get_log_bed_patient_sensors(db: Session = Depends(get_db)):
    return crud.get_log_bed_patient_sensors(db)

# Get log bed patient sensor by ID
@router.get("/{log_bed_patient_sensor_id}", response_model=schemas.LogBedPatientSensorResponse)
def get_log_bed_patient_sensor(log_bed_patient_sensor_id: int, db: Session = Depends(get_db)):
    return crud.get_log_bed_patient_sensor(log_bed_patient_sensor_id, db)

# Create a new log bed patient sensor
@router.post("/", response_model=schemas.LogBedPatientSensorResponse)
def create_log_bed_patient_sensor(log_bed_patient_sensor: schemas.LogBedPatientSensorCreate, db: Session = Depends(get_db)):
    return crud.create_log_bed_patient_sensor(log_bed_patient_sensor, db)

# Update log bed patient sensor
@router.put("/{log_bed_patient_sensor_id}", response_model=schemas.LogBedPatientSensorResponse)
def update_log_bed_patient_sensor(log_bed_patient_sensor_id: int, log_bed_patient_sensor: schemas.LogBedPatientSensorCreate, db: Session = Depends(get_db)):
    return crud.update_log_bed_patient_sensor(log_bed_patient_sensor_id, log_bed_patient_sensor, db)

# Delete log bed patient sensor
@router.delete("/{log_bed_patient_sensor_id}")
def delete_log_bed_patient_sensor(log_bed_patient_sensor_id: int, db: Session = Depends(get_db)):
    return crud.delete_log_bed_patient_sensor(log_bed_patient_sensor_id, db)

@router.get("/notifications/bed/{bed_id}/patient/{patient_id}",response_model=list[schemas.LogBedPatientSensorResponse])
def get_log_notifications_by_bed_and_patient(bed_id:int,patient_id:int,db: Session = Depends(get_db)):
    return crud.get_log_notifications_by_bed_and_patient(bed_id,patient_id,db)