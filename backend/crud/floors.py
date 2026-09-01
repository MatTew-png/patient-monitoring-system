from datetime import datetime, timezone
from fastapi import Depends, HTTPException
from models.base import get_db
from sqlalchemy.orm import Session, joinedload
from models.floors import Floor
from schemas.floors import FloorCreate

# Create floor
def create_floor(floor: FloorCreate, db: Session = Depends(get_db)):
    db_floors = Floor(**floor.model_dump())
    db.add(db_floors)
    db.commit()
    db.refresh(db_floors)
    return db_floors

# Read floors
def get_floors(db: Session = Depends(get_db)):
    floors = db.query(Floor).options(
        joinedload(Floor.building)
    ),filter(Floor.deleted_at.is_(None)).all()
    return floors

# Read floor
def get_floor(floor_id: int, db: Session = Depends(get_db)):
    floor = db.query(Floor).options(
         joinedload(Floor.building) 
    ).filter(Floor.floor_id == floor_id,Floor.deleted_at.is_(None)).first()
    if floor is None:
        raise HTTPException(status_code=404, detail="Floor not found")
    return floor

# Update floor
def update_floor(floor_id: int, floor: FloorCreate, db: Session = Depends(get_db)):
    db_floor = db.query(Floor).filter(Floor.floor_id == floor_id).first()
    if db_floor is None:
        raise HTTPException(status_code=404, detail="Floor not found")
    # Loop ผ่านทุก key-value ใน floor.model_dump() และ setattr ให้กับ db_floor
    for key, value in floor.model_dump().items(): # floor.model_dump() จะมีทั้ง floor_name และ building_id
        setattr(db_floor, key, value)
    db.commit()
    db.refresh(db_floor)
    return db_floor

# Delete floor
def softdelete_floor(floor_id: int, db: Session = Depends(get_db)) -> dict:
    db_floor_model = db.query(Floor).filter(
        Floor.floor_id == floor_id,
        Floor.deleted_at.is_(None)  # Check if not already soft-deleted
    ).first()

    if db_floor_model is None:
        raise HTTPException(status_code=404, detail=f"Floor with id {floor_id} not found or already deleted")

    db_floor_model.deleted_at = datetime.now(timezone.utc)

    print(f"INFO: Floor {db_floor_model.floor_id} has been marked as deleted.")

    db.commit()
    return {"message": f"Floor with id {floor_id} marked as deleted successfully"}