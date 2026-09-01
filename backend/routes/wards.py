from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from models import wards as models
from models.base import SessionLocal
from models.base import engine, Base, get_db
import crud.wards as crud
import crud.wards as crud_ward
from schemas import wards as schemas

router = APIRouter(
    prefix="/wards",
    tags=["wards"],
    responses={404: {"description": "Not found"}},
)

# Dependency: Get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=schemas.WardResponse)
def create_ward(ward: schemas.WardCreateWithRooms, db: Session = Depends(get_db)):
    """
    Create a new ward and assign it to the specified rooms.
    """
    return crud.create_ward(ward_data=ward, db=db)

@router.patch("/{ward_id}", response_model=schemas.WardResponse)
def update_ward(ward_id: int, ward: schemas.WardCreateWithRooms, db: Session = Depends(get_db)):
    return crud.update_ward(ward_id, ward, db)

@router.delete("/{ward_id}")
def delete_ward(ward_id: int, db: Session = Depends(get_db)):
    return crud.softdelete_ward(ward_id, db)


@router.get("/all/full_details")
def get_all_wards_full_details_route(db: Session = Depends(get_db)):
    wards_data = crud_ward.get_all_wards_with_full_details(db=db)
    return wards_data

@router.get("/{ward_id}/full_details")
def get_ward_full_details_route(ward_id: int, db: Session = Depends(get_db)):
    ward = crud_ward.get_ward_with_full_details(ward_id, db=db)
    if not ward:
        raise HTTPException(status_code=404, detail="Ward not found")
    return ward
