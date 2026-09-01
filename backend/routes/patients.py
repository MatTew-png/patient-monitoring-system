from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from models import patient as models
from schemas import patient as schemas
from models.base import SessionLocal
from models.base import engine, Base, get_db
import crud.patient as crud
from schemas import patient as patient_schemas
import crud.patient as crud_patient
router = APIRouter(
    prefix="/patients",
    tags=["patients"],
    responses={404: {"description": "Not found"}},
)

# Dependency: Get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Get all patients
@router.get("/", response_model=list[schemas.PatientResponse])
def get_patients(db: Session = Depends(get_db)):
    return db.query(models.Patient).all()

# Get patient by ID
@router.get("/{patient_id}")
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    return crud.get_patient(patient_id,db)
    

# Create a new patient
@router.post("/", response_model=schemas.PatientResponse)
def create_patient(patient: schemas.PatientCreate, db: Session = Depends(get_db)):
    newPatient = crud.create_patient(patient,db)
    return newPatient


@router.put("/{patient_id}", response_model=schemas.PatientResponse)
def update_patient(patient_id: int, patient: schemas.PatientCreate, db: Session = Depends(get_db)):
    return crud.update_patient(patient_id, patient, db)

@router.patch("/edit/{patient_id}", response_model=schemas.PatientResponse)
def update_patient_partial(patient_id: int, patient: schemas.PatientCreate, db: Session = Depends(get_db)):
    return crud.update_patient_partial(patient_id, patient, db)

@router.delete("/{patient_id}")
def delete_patient(patient_id: int, db: Session = Depends(get_db)):
    return crud.softdelete_patient(patient_id, db)


@router.get("/patientWait/all", response_model=list[schemas.PatientResponse])
def get_all_patient_wait(db: Session = Depends(get_db)):
    return crud.get_all_patient_wait(db)


@router.get("/all/full_details")
def get_all_patients_full_details_route(db: Session = Depends(get_db)):
    patients_data = crud_patient.get_all_patients_with_full_details(db=db)
    return patients_data

@router.get("/{patient_id}/full_details")
def get_patient_full_details_route(patient_id: int, db: Session = Depends(get_db)):
    patient = crud_patient.get_patient_with_full_details(patient_id, db=db)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@router.post("/{patient_id}/upload_image")
def upload_patient_image(patient_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    return crud.upload_image(patient_id, db, file)

@router.get("/patient_information/{patient_id}")
def get_patient_information(patient_id: int, db: Session = Depends(get_db)):
    return crud.get_patient_information(patient_id, db)
