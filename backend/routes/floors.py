from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import floors as models
from schemas import floors as schemas
from models.base import SessionLocal
from models.base import engine, Base, get_db
import crud.floors as crud

router = APIRouter(
    prefix="/floors",
    tags=["floors"],
    responses={404: {"description": "Not found"}},
)

# Dependency: Get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Get all floors
@router.get("/", response_model=list[schemas.FloorResponse])
def get_floors(db: Session = Depends(get_db)):
    return db.query(models.Floor).filter(models.Floor.deleted_at.is_(None)).all()

# Get floor by ID
@router.get("/{floor_id}", response_model=schemas.FloorResponse)
def get_floor(floor_id: int, db: Session = Depends(get_db)):
    floor = db.query(models.Floor).filter(models.Floor.floor_id == floor_id,models.Floor.deleted_at.is_(None)).first()
    if not floor:
        raise HTTPException(status_code=404, detail="Floor not found")
    return floor

# Create a new floor
@router.post("/", response_model=schemas.FloorResponse)
def create_floor(floor: schemas.FloorCreate, db: Session = Depends(get_db)):
    new_floor = models.Floor(**floor.model_dump())
    db.add(new_floor)
    db.commit()
    db.refresh(new_floor)
    return new_floor

# Update floor
@router.patch("/{floor_id}", response_model=schemas.FloorResponse)
def update_floor(floor_id: int, floor: schemas.FloorUpdate, db: Session = Depends(get_db)):
    return crud.update_floor(floor_id, floor, db)

# Delete floor
@router.delete("/{floor_id}")
def delete_floor(floor_id: int, db: Session = Depends(get_db)):
    return crud.softdelete_floor(floor_id, db)
