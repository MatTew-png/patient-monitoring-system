from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import rooms as models
from schemas import rooms as schemas
from models.base import SessionLocal
from models.base import engine, Base, get_db
import crud.rooms as crud

router = APIRouter(
    prefix="/rooms",
    tags=["rooms"],
    responses={404: {"description": "Not found"}},
)

# Dependency: Get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# GET /rooms/  (Get all rooms)
@router.get("/", response_model=List[schemas.RoomResponse])
def get_all_rooms(db: Session = Depends(get_db)):
    return crud.get_rooms(db=db)

# GET /rooms/free
@router.get("/free", response_model=List[schemas.RoomResponse])
def get_rooms_free_route(db: Session = Depends(get_db)):
    return crud.get_rooms_free(db=db)

# GET /rooms/{room_id}  <--- This MUST be after "/free" and "/unassigned/all"
@router.get("/{room_id}", response_model=schemas.RoomResponse)
def get_room_by_id(room_id: int, db: Session = Depends(get_db)):
    room = crud.get_room(room_id=room_id, db=db)
    if room is None:
        raise HTTPException(status_code=404, detail="Room not found")
    return room

# POST /rooms/
@router.post("/", response_model=schemas.RoomResponse)
def create_room(room: schemas.RoomCreateNew, db: Session = Depends(get_db)):
    return crud.create_room(room, db)

# PATCH /rooms/{room_id}
@router.patch("/{room_id}", response_model=schemas.RoomResponse)
def update_room(room_id: int, room: schemas.RoomUpdate, db: Session = Depends(get_db)):
    return crud.update_room(room_id=room_id, room=room, db=db)

# DELETE /rooms/{room_id}
@router.delete("/{room_id}")
def delete_room(room_id: int, db: Session = Depends(get_db)):
    return crud.softdelete_room(room_id=room_id, db=db)

# POST /rooms/batch  (Create multiple rooms)
@router.post("/batch_create", response_model=List[schemas.RoomResponse])
def create_rooms_batch(room: schemas.RoomCreateNew, db: Session = Depends(get_db)):
    return crud.create_rooms_batch(room, db)


