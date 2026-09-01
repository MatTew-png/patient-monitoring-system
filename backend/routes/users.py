from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from models import users as models
from schemas import users as schemas
from models.base import SessionLocal
from models.base import engine, Base, get_db
import crud.users as crud

router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={404: {"description": "Not found"}},
)

# Dependency: Get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create new user
@router.post("/", response_model=schemas.UserResponse)
def create_user_endpoint(user_input: schemas.UserCreate, db: Session = Depends(get_db)): # เปลี่ยนชื่อ parameter เพื่อความชัดเจน
    # เรียกใช้ฟังก์ชันจาก crud/users.py ซึ่งมีการ hash password อยู่ข้างใน
    return crud.create_user(user_create_data=user_input, db=db)

# Update user
@router.put("/{user_id}", response_model=schemas.UserResponse)
def update_user(user_id: int, user: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.update_user(user_id, user, db)


@router.delete("/{user_id}", response_model=dict) # หรือ status_code=204 No Content
def delete_user_route(user_id: int, db: Session = Depends(get_db)): # เพิ่ม _route ต่อท้ายชื่อฟังก์ชัน
    # crud_users.delete_user ควรจะ raise HTTPException ถ้าไม่เจอ user
    return crud.delete_user(user_id=user_id, db=db)

# ตัวอย่าง API Route สำหรับ Get Users (ที่กรอง soft delete แล้ว)
@router.get("/", response_model=List[schemas.UserResponse]) # ใช้ user_schemas
def get_users_route(db: Session = Depends(get_db)): # เพิ่ม _route
    active_users = crud.get_users(db=db)
    return active_users


@router.get("/{user_id}", response_model=schemas.UserResponse)
def get_user_route(user_id: int, db: Session = Depends(get_db)): # เพิ่ม _route ต่อท้ายชื่อฟังก์ชัน
    # เรียก CRUD function ที่มีการกรอง soft delete และจัดการ HTTPException แล้ว
    db_user = crud.get_user(user_id=user_id, db=db)
    # ไม่จำเป็นต้อง check if db_user is None อีก เพราะ CRUD function จะ raise 404 ให้แล้ว
    return db_user

@router.post("/{user_id}/upload-image")
def upload_user_image(user_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    return crud.upload_user_image(user_id, file, db)

@router.patch("/edit/{user_id}", response_model=schemas.UserResponse)
def update_user(user_id: int, user: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.update_user(user_id, user, db)

