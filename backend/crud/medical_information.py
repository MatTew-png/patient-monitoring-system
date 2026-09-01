from fastapi import Depends, HTTPException
from models.base import get_db
from sqlalchemy.orm import Session, joinedload
from models.medical_information import Medical_Information
from schemas.medical_information import MedicalInformationCreate

# Create medical information
def create_medical_information(medical_information: MedicalInformationCreate, db: Session = Depends(get_db)):
    db_medical_informations = Medical_Information(**medical_information.model_dump())
    db.add(db_medical_informations)
    db.commit()
    db.refresh(db_medical_informations)
    return db_medical_informations

# Read medical information
def get_medical_informations(db: Session = Depends(get_db)):
    medical_informations = db.query(Medical_Information).options(
        joinedload(Medical_Information.patient)
    ).all()
    return medical_informations

# Read a single medical information
def get_medical_information(medical_info_id: int, db: Session = Depends(get_db)):
    medical_information = db.query(Medical_Information).filter(Medical_Information.medical_info_id == medical_info_id).options(
        joinedload(Medical_Information.patient)
    ).first()
    if medical_information is None:
        raise HTTPException(status_code=404, detail="Medical information not found")
    return medical_information

# Update medical information
def update_medical_information(medical_info_id: int, medical_information: MedicalInformationCreate, db: Session = Depends(get_db)):
    db_medical_information = db.query(Medical_Information).filter(Medical_Information.medical_info_id == medical_info_id).first()
    if db_medical_information is None:
        raise HTTPException(status_code=404, detail="Medical information not found")
    for key, value in medical_information.model_dump().items():
        setattr(db_medical_information, key, value)
    db.commit()
    db.refresh(db_medical_information)
    return db_medical_information

# Delete medical information
def delete_medical_information(medical_info_id: int, db: Session = Depends(get_db)):
    db_medical_information = db.query(Medical_Information).filter(Medical_Information.medical_info_id == medical_info_id).first()
    if db_medical_information is None:
        raise HTTPException(status_code=404, detail="Medical information not found")
    db.delete(db_medical_information)
    db.commit()
    return {"message": "Medical information deleted"}