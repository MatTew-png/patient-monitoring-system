from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import sensor_notifications_config as models
from schemas import sensor_notifications_config as schemas
from models.base import SessionLocal
from models.base import engine, Base, get_db
import crud.sensor_notifications_config as crud

router = APIRouter(
    prefix="/sensor_notifications_configs",
    tags=["sensor_notifications_configs"],
    responses={404: {"description": "Not found"}},
)

# Dependency: Get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Get all sensor notification configs
@router.get("/", response_model=list[schemas.SensorNotificationsConfigResponse])
def get_sensor_notifications_configs(db: Session = Depends(get_db)):
    return db.query(models.Sensor_Notifications_Config).all()

# Get sensor notification config by ID
@router.get("/{sensor_notifications_config_id}", response_model=schemas.SensorNotificationsConfigResponse)
def get_sensor_notifications_config(sensor_notifications_config_id: int, db: Session = Depends(get_db)):
    sensor_notifications_config = db.query(models.Sensor_Notifications_Config).filter(models.Sensor_Notifications_Config.sensor_notifications_config_id == sensor_notifications_config_id).first()
    if not sensor_notifications_config:
        raise HTTPException(status_code=404, detail="Sensor notification config not found")
    return sensor_notifications_config

# Create new sensor notification config
@router.post("/", response_model=schemas.SensorNotificationsConfigResponse)
def create_sensor_notifications_config(sensor_notifications_config: schemas.SensorNotificationsConfigCreate, db: Session = Depends(get_db)):
    new_sensor_notifications_config = models.Sensor_Notifications_Config(**sensor_notifications_config.model_dump())  
    db.add(new_sensor_notifications_config)
    db.commit()
    db.refresh(new_sensor_notifications_config)
    return new_sensor_notifications_config

# Update sensor notification config
@router.put("/{sensor_notifications_config_id}", response_model=schemas.SensorNotificationsConfigResponse)
def update_sensor_notifications_config(sensor_notifications_config_id: int, sensor_notifications_config: schemas.SensorNotificationsConfigCreate, db: Session = Depends(get_db)):
    return crud.update_sensor_notifications_config(sensor_notifications_config_id, sensor_notifications_config, db)

# Delete sensor notification config
@router.delete("/{sensor_notifications_config_id}")
def delete_sensor_notifications_config(sensor_notifications_config_id: int, db: Session = Depends(get_db)):
    return crud.delete_sensor_notifications_config(sensor_notifications_config_id, db)


@router.get("/sensor-notifications-config/{bed_id}", response_model=List[schemas.SensorNotificationsConfigResponse])
def get_sensor_notifications_config(bed_id: int, db: Session = Depends(get_db)):
    return crud.get_sensor_notifications_config(bed_id, db)

@router.patch("/update-sensor-notifications-config/{sensor_id}/{sensor_notifications_config_id}", response_model=schemas.SensorNotificationsConfigResponse)
def update_sensor_notifications_config(
    sensor_id: int,
    sensor_notifications_config_id: int,
    update_data: schemas.SensorNotificationsConfigCreate, 
    db: Session = Depends(get_db)
):
    return crud.update_sensor_notifications_config(sensor_id, sensor_notifications_config_id, update_data, db)
