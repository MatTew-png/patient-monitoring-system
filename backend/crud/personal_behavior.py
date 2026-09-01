from fastapi import Depends, HTTPException
from models.base import get_db
from sqlalchemy.orm import Session, joinedload
from models.personal_behavior import Personal_Behavior
from schemas.personal_behavior import PersonalBehaviorCreate

# Create personal behavior
def create_personal_behavior(personal_behavior: PersonalBehaviorCreate, db: Session = Depends(get_db)):
    db_personal_behaviors = Personal_Behavior(**personal_behavior.model_dump())
    db.add(db_personal_behaviors)
    db.commit()
    db.refresh(db_personal_behaviors)
    return db_personal_behaviors

# Read personal behaviors
def get_personal_behaviors(db: Session = Depends(get_db)):
    personal_behaviors = db.query(Personal_Behavior).options(
        joinedload(Personal_Behavior.patient)
    ).all()
    return personal_behaviors

# Read a single personal behavior
def get_personal_behavior(personal_behavior_id: int, db: Session = Depends(get_db)):
    personal_behavior = db.query(Personal_Behavior).filter(Personal_Behavior.personal_behavior_id == personal_behavior_id).options(
        joinedload(Personal_Behavior.patient)
    ).first()
    if personal_behavior is None:
        raise HTTPException(status_code=404, detail="Personal behavior not found")
    return personal_behavior

# Update personal behavior
def update_personal_behavior(personal_behavior_id: int, personal_behavior: PersonalBehaviorCreate, db: Session = Depends(get_db)):
    db_personal_behavior = db.query(Personal_Behavior).filter(Personal_Behavior.personal_behavior_id == personal_behavior_id).first()
    if db_personal_behavior is None:
        raise HTTPException(status_code=404, detail="Personal behavior not found")
    for key, value in personal_behavior.model_dump().items():
        setattr(db_personal_behavior, key, value)
    db.commit()
    db.refresh(db_personal_behavior)
    return db_personal_behavior

# Delete personal behavior
def delete_personal_behavior(personal_behavior_id: int, db: Session = Depends(get_db)):
    db_personal_behavior = db.query(Personal_Behavior).filter(Personal_Behavior.personal_behavior_id == personal_behavior_id).first()
    if db_personal_behavior is None:
        raise HTTPException(status_code=404, detail="Personal behavior not found")
    db.delete(db_personal_behavior)
    db.commit()
    return {"message": "Personal behavior deleted"}