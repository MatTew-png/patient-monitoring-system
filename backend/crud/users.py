# backend/crud/users.py
from typing import List, Optional # เพิ่ม Optional และ List
from fastapi import Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from datetime import datetime, timezone # เพิ่ม timezone
from models.users import User as UserModel

from models.users import User # model User
from schemas.users import UserCreate # schema UserCreate
from passlib.context import CryptContext # สำหรับ password hashing
# from models.base import get_db # ถ้า get_db ไม่ได้ถูก pass มาจาก route โดยตรง
from services.image_service import save_image # สำหรับการจัดการไฟล์ภาพ
from fastapi import HTTPException, status


# ...
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# ...
def create_user(user_create_data: UserCreate, db: Session) -> UserModel: # ใช้ UserCreate จาก schemas
    existing = db.query(UserModel).filter(
        UserModel.user_username == user_create_data.user_username,
        UserModel.deleted_at.is_(None)  # เพิ่มเงื่อนไข deleted_at เป็น NULL
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    hashed_password = pwd_context.hash(user_create_data.user_password) # <--- **ทำการ Hash ตรงนี้**
    db_user = UserModel( # ใช้ UserModel จาก models
        ward_id=user_create_data.ward_id,
        user_name=user_create_data.user_name,
        user_position=user_create_data.user_position,
        user_username=user_create_data.user_username,
        user_password=hashed_password  
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Read all active users (ปรับปรุงให้กรอง soft deleted)
def get_users(db: Session) -> List[User]:
    users = db.query(User).filter(User.deleted_at.is_(None)).all() # เพิ่ม filter
    return users

# Read a single active user (ปรับปรุงให้กรอง soft deleted)
def get_user(user_id: int, db: Session) -> User:
    user = db.query(User).filter(
        User.user_id == user_id,
        User.deleted_at.is_(None) 
    ).first()
    if user is None:
        raise HTTPException(status_code=404, detail=f"User with id {user_id} not found or has been deleted")
    return user


# Soft Delete user
def delete_user(user_id: int, db: Session) -> dict:
    db_user_model = db.query(User).filter(
        User.user_id == user_id,
        User.deleted_at.is_(None) # ตรวจสอบว่ายังไม่ถูกลบไปแล้ว
    ).first()
    if db_user_model is None:
        raise HTTPException(status_code=404, detail=f"User with id {user_id} not found or already deleted")
    
    # ตั้งค่า deleted_at เป็นเวลาปัจจุบัน (UTC แนะนำ)
    db_user_model.deleted_at = datetime.now(timezone.utc)
    
    
    db.commit()
    return {"message": f"User with id {user_id} marked as deleted successfully"}

# Upload user image
def upload_user_image(user_id: int, file: UploadFile, db: Session):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    image_path = save_image(file, sub_dir="users")
    user.image_path = image_path
    db.commit()

    return {"message": "Profile uploaded", "image_url": image_path}

# Update user
def update_user(user_id: int, user: UserCreate, db: Session) -> UserModel:
    db_user = db.query(User).filter(User.user_id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update fields
    db_user.user_name = user.user_name
    db_user.user_position = user.user_position
    db_user.user_username = user.user_username
    db_user.ward_id = user.ward_id
    # Only hash the password if it's provided
    if user.user_password:
        db_user.user_password = pwd_context.hash(user.user_password)

    db.commit()
    return db_user