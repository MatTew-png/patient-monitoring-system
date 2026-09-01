from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.auth import get_current_user
from models import beds as models
from models.users import User
from schemas import beds as schemas
from models.base import SessionLocal
from models.base import engine, Base, get_db
from models.sensors import Sensor
import crud.beds as crud
import crud.sensors as crudss

router = APIRouter(
    prefix="/beds",
    tags=["beds"],
    responses={404: {"description": "Not found"}},
)

# Dependency: Get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Get all beds
@router.get("/", response_model=List[schemas.BedResponse]) # ใช้ bed_schemas
def get_beds_route(db: Session = Depends(get_db)): # เพิ่ม _route ต่อท้ายชื่อฟังก์ชัน
    # เรียก CRUD function ที่มีการ filter soft delete แล้ว
    active_beds = crud.get_beds(db=db)
    return active_beds

# Get bed by ID
@router.get("/{bed_id}", response_model=schemas.BedResponse)
def get_bed(bed_id: int, db: Session = Depends(get_db)):
    return crud.get_bed(bed_id, db)

# Get activated beds
@router.get("/activated/all", response_model=List[schemas.BedResponse])
def get_bed_activated_route( #
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  #
):
    # Pass the resolved db and current_user to the CRUD function
    return crud.get_bed_activated(db=db, current_user=current_user)

@router.get("/page/activated", response_model=List[schemas.BedResponse])
def read_activated_beds(
    skip: int = 0,
    limit: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud.get_bed_activated_paginated(db, current_user, skip=skip, limit=limit)

@router.get("/page/activated/count", response_model=int)
def count_activated_beds(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud.count_bed_activated(db, current_user)

# Create a new bed
@router.post("/", response_model=schemas.BedResponse)
def create_bed(bed_input: schemas.BedCreate, db: Session = Depends(get_db)):
    return crud.create_bed(bed_create_data=bed_input, db=db)



# Update bed
@router.put("/{bed_id}", response_model=schemas.BedResponse)
def update_bed(bed_id: int, bed: schemas.BedCreate, db: Session = Depends(get_db)):
    return crud.update_bed(bed_id, bed, db)

# Delete bed
@router.delete("/{bed_id}")
def delete_bed(bed_id: int, db: Session = Depends(get_db)):
    return crud.softdelete_bed(bed_id, db)

# Patch selectedShowSensorId
@router.patch("/{bed_id}/selectedShowSensorId/{sensor_id}", response_model=schemas.BedResponse)
def patch_selected_show_sensor_id(bed_id: int, sensor_id: int, db: Session = Depends(get_db)):
    updated_bed = crud.patch_selected_show_sensor_id(bed_id, sensor_id, db)
    
    if not updated_bed:
        raise HTTPException(status_code=404, detail="Bed not found")
    
    return updated_bed

# Patch removeShowSensorId
@router.patch("/{bed_id}/removeShowSensorId/{sensor_id}", response_model=schemas.BedResponse)
def patch_remove_show_sensor_id(bed_id: int, sensor_id: int, db: Session = Depends(get_db)):
    updated_bed = crud.patch_remove_show_sensor_id(bed_id, sensor_id, db)
    
    if not updated_bed:
        raise HTTPException(status_code=404, detail="Bed not found")
    
    return updated_bed



@router.patch("/{bed_id}/bedConfig", response_model=schemas.BedResponse) # หรือ Bed
def update_existing_bed(
    bed_id: int,
    bed_data: schemas.BedUpdate, 
    db: Session = Depends(get_db)
):
    updated_bed = crud.patch_bed(db=db, bed_id=bed_id, bed_data=bed_data)
    if updated_bed is None:
        raise HTTPException(status_code=404, detail="Bed not found")
    return updated_bed

@router.put("/{bed_id}/remove-patient/{patient_id}", response_model=dict)
def remove_patient_from_bed(bed_id: int, patient_id: int, db: Session = Depends(get_db)):
    return crud.remove_patient_from_bed(bed_id,patient_id,db)

@router.get("/sensor-config/{bed_id}", response_model=schemas.BedWithSensorConfigResponse)
def loadSensorNotificationConfig(bed_id: int, db: Session = Depends(get_db)):
    return crud.loadSensorNotificationConfig(bed_id,db)


# Get activated beds
@router.get("/free/all", response_model=list[schemas.BedResponse])
def get_bed_activated(db: Session = Depends(get_db)):
    return crud.get_bed_free(db)

# Edit bed
@router.patch("/edit/{bed_id}")
def edit_bed(bed_id: int, bed: schemas.BedCreate, db: Session = Depends(get_db)):
    return crud.update_bed(bed_id, bed, db)


@router.get("/free/ward", response_model=List[schemas.BedResponse])
def get_bed_free_ward_route( #
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  #
):
    # Pass the resolved db and current_user to the CRUD function
    return crud.get_bed_free_ward(db=db, current_user=current_user)
