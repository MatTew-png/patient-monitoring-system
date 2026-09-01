from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import medical_information as models
from schemas import medical_information as schemas
from models.base import SessionLocal
from models.base import engine, Base, get_db
import crud.medical_information as crud

router = APIRouter(
    prefix="/medical_informations",
    tags=["medical_informations"],
    responses={404: {"description": "Not found"}},
)

# Dependency: Get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Get all medical information
@router.get("/", response_model=list[schemas.MedicalInformationResponse])
def get_medical_informations(db: Session = Depends(get_db)):
    return db.query(models.Medical_Information).all()

# Get medical information by ID
@router.get("/{medical_info_id}", response_model=schemas.MedicalInformationResponse)
def get_medical_information(medical_info_id: int, db: Session = Depends(get_db)):
    medical_information = db.query(models.Medical_Information).filter(models.Medical_Information.medical_info_id == medical_info_id).first()
    if not medical_information:
        raise HTTPException(status_code=404, detail="Medical information not found")
    return medical_information

# Create new medical information
@router.post("/", response_model=schemas.MedicalInformationResponse)
def create_medical_information(medical_information: schemas.MedicalInformationCreate, db: Session = Depends(get_db)):
    new_medical_information = models.Medical_Information(**medical_information.model_dump())  
    db.add(new_medical_information)
    db.commit()
    db.refresh(new_medical_information)
    return new_medical_information

# Update medical information
@router.put("/{medical_info_id}", response_model=schemas.MedicalInformationResponse)
def update_medical_information(medical_info_id: int, medical_information: schemas.MedicalInformationCreate, db: Session = Depends(get_db)):
    return crud.update_medical_information(medical_info_id, medical_information, db)

# Delete medical information
@router.delete("/{medical_info_id}")
def delete_medical_information(medical_info_id: int, db: Session = Depends(get_db)):
    return crud.delete_medical_information(medical_info_id, db)
