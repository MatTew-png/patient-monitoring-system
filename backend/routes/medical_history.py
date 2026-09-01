from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import medical_history as models
from schemas import medical_history as schemas
from models.base import SessionLocal
from models.base import engine, Base, get_db
import crud.medical_history as crud

router = APIRouter(
    prefix="/medical_history",
    tags=["medical_history"],
    responses={404: {"description": "Not found"}},
)

# Dependency: Get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Get all medical histories
@router.get("/", response_model=list[schemas.MedicalHistoryResponse])
def get_medical_histories(db: Session = Depends(get_db)):
    return db.query(models.Medical_History).all()

# Get medical history by ID
@router.get("/{med_history_id}", response_model=schemas.MedicalHistoryResponse)
def get_medical_history(med_history_id: int, db: Session = Depends(get_db)):
    medical_history = db.query(models.Medical_History).filter(models.Medical_History.med_history_id == med_history_id).first()
    if not medical_history:
        raise HTTPException(status_code=404, detail="Medical history not found")
    return medical_history

# Create a new medical history
@router.post("/", response_model=schemas.MedicalHistoryResponse)
def create_medical_history(medical_history: schemas.MedicalHistoryCreate, db: Session = Depends(get_db)):
    new_medical_history = models.Medical_History(**medical_history.model_dump())  
    db.add(new_medical_history)
    db.commit()
    db.refresh(new_medical_history)
    return new_medical_history

# Update medical history
@router.put("/{med_history_id}", response_model=schemas.MedicalHistoryResponse)
def update_medical_history(med_history_id: int, medical_history: schemas.MedicalHistoryCreate, db: Session = Depends(get_db)):
    return crud.update_medical_history(med_history_id, medical_history, db)

# Delete medical history
@router.delete("/{med_history_id}")
def delete_medical_history(med_history_id: int, db: Session = Depends(get_db)):
    return crud.delete_medical_history(med_history_id, db)
