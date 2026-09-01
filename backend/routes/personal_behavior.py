from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import personal_behavior as models
from schemas import personal_behavior as schemas
from models.base import SessionLocal
from models.base import engine, Base, get_db
import crud.personal_behavior as crud

router = APIRouter(
    prefix="/personal_behaviors",
    tags=["personal_behaviors"],
    responses={404: {"description": "Not found"}},
)

# Dependency: Get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Get all personal behaviors
@router.get("/", response_model=list[schemas.PersonalBehaviorResponse])
def get_personal_behaviors(db: Session = Depends(get_db)):
    return db.query(models.Personal_Behavior).all()

# Get personal behavior by ID
@router.get("/{personal_behavior_id}", response_model=schemas.PersonalBehaviorResponse)
def get_personal_behavior(personal_behavior_id: int, db: Session = Depends(get_db)):
    personal_behavior = db.query(models.Personal_Behavior).filter(models.Personal_Behavior.personal_behavior_id == personal_behavior_id).first()
    if not personal_behavior:
        raise HTTPException(status_code=404, detail="Personal behavior not found")
    return personal_behavior

# Create new personal behavior
@router.post("/", response_model=schemas.PersonalBehaviorResponse)
def create_personal_behavior(personal_behavior: schemas.PersonalBehaviorCreate, db: Session = Depends(get_db)):
    new_personal_behavior = models.Personal_Behavior(**personal_behavior.model_dump())  
    db.add(new_personal_behavior)
    db.commit()
    db.refresh(new_personal_behavior)
    return new_personal_behavior

# Update personal behavior
@router.put("/{personal_behavior_id}", response_model=schemas.PersonalBehaviorResponse)
def update_personal_behavior(personal_behavior_id: int, personal_behavior: schemas.PersonalBehaviorCreate, db: Session = Depends(get_db)):
    return crud.update_personal_behavior(personal_behavior_id, personal_behavior, db)

# Delete personal behavior
@router.delete("/{personal_behavior_id}")
def delete_personal_behavior(personal_behavior_id: int, db: Session = Depends(get_db)):
    return crud.delete_personal_behavior(personal_behavior_id, db)
