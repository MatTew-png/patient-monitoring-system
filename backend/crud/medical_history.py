from fastapi import Depends, HTTPException
from models.base import get_db
from sqlalchemy.orm import Session, joinedload
from models.medical_history import Medical_History
from schemas.medical_history import MedicalHistoryCreate

# Create medical history
def create_medical_history(medical_history: MedicalHistoryCreate, db: Session = Depends(get_db)):
    db_medical_historys = Medical_History(**medical_history.model_dump())
    db.add(db_medical_historys)
    db.commit()
    db.refresh(db_medical_historys)
    return db_medical_historys

# Read medical histories
def get_medical_historys(db: Session = Depends(get_db)):
    med_historys = db.query(Medical_History).options(
        joinedload(Medical_History.patient)
    ).all()
    return med_historys

# Read a single medical history
def get_medical_history(med_history_id: int, db: Session = Depends(get_db)):
    med_history = db.query(Medical_History).filter(Medical_History.med_history_id == med_history_id).options(
        joinedload(Medical_History.patient)
    ).first()
    if med_history is None:
        raise HTTPException(status_code=404, detail="Medical history not found")
    return med_history

# Update medical history
def update_medical_history(med_history_id: int, medical_history: MedicalHistoryCreate, db: Session = Depends(get_db)):
    db_med_history = db.query(Medical_History).filter(Medical_History.med_history_id == med_history_id).first()
    if db_med_history is None:
        raise HTTPException(status_code=404, detail="Medical history not found")
    for key, value in medical_history.model_dump().items():
        setattr(db_med_history, key, value)
    db.commit()
    db.refresh(db_med_history)
    return db_med_history

# Delete medical history
def delete_medical_history(med_history_id: int, db: Session = Depends(get_db)):
    db_med_history = db.query(Medical_History).filter(Medical_History.med_history_id == med_history_id).first()
    if db_med_history is None:
        raise HTTPException(status_code=404, detail="Medical history not found")
    db.delete(db_med_history)
    db.commit()
    return {"message": "Medical history deleted"}