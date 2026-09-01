from datetime import datetime, timezone
from fastapi import HTTPException,Depends
from models.base import get_db
from sqlalchemy.orm import Session

from models.line_group import Line_Group
from schemas.line_group import LineGroupCreate, LineGroupUpdate

def create_line_group_byId(line_group_id: str, db: Session = Depends(get_db)):
    # ค้นหากลุ่มทั้งหมดที่ตรง line_group_id แม้จะ soft deleted
    search_line = db.query(Line_Group).filter(Line_Group.line_group_id == line_group_id).first()
    
    if search_line:
        if search_line.deleted_at is not None:
            # restore record แทนการสร้างใหม่
            search_line.deleted_at = None
            db.add(search_line)
            db.commit()
            db.refresh(search_line)
            print(f"กู้กลุ่ม '{line_group_id}' กลับมาเป็นปกติแล้ว")
        else:
            print("มีกลุ่มอยู่แล้วและ active อยู่")
        return search_line
    else:
        # สร้าง record ใหม่ก็ต่อเมื่อไม่เจอ record ใน DB เลย
        line_group = Line_Group(
            line_group_id=line_group_id,
            line_group_name="กรุณาตั้งชื่อกลุ่มไลน์ของท่าน",
        )
        db.add(line_group)
        db.commit()
        db.refresh(line_group)
        print('สร้างสำเร็จ')
        return line_group

def get_line_group(db: Session, line_group_id: str):
    """
    ดึงข้อมูล Line Group ที่ยัง active อยู่ ตาม ID
    """
    obj = db.query(Line_Group).filter(Line_Group.line_group_id == line_group_id, Line_Group.deleted_at == None).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Line group not found")
    return obj


def get_line_group_by_id_including_deleted(db: Session, line_group_id: str):
    """
    (เพิ่มใหม่) ดึงข้อมูล Line Group ตาม ID โดยไม่สนใจสถานะ deleted_at
    """
    return db.query(Line_Group).filter(Line_Group.line_group_id == line_group_id).first()


def get_line_groups(db: Session, skip: int = 0, limit: int = 100):
    """
    ดึงข้อมูล Line Group ทั้งหมดที่ยัง active อยู่
    """
    return db.query(Line_Group).filter(Line_Group.deleted_at == None).offset(skip).limit(limit).all()


def create_line_group(db: Session, line_group: LineGroupCreate, line_group_id: str):
    """
    สร้าง Line Group ใหม่
    """
    db_line_group = Line_Group(**line_group.model_dump(), line_group_id=line_group_id)
    db.add(db_line_group)
    db.commit()
    db.refresh(db_line_group)
    return db_line_group


def update_line_group(db: Session, *, db_obj: Line_Group, obj_in: LineGroupUpdate):
    """
    (แก้ไข) อัปเดตข้อมูล Line Group (เป็นฟังก์ชันกลางที่รับ object มาแล้ว)
    """
    if(obj_in.ward_id==0):
        obj_in.ward_id = None
    update_data = obj_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_obj, key, value)
    
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def delete_line_group(db: Session, line_group_id: str):
    """
    ลบข้อมูล Line Group (Soft Delete)
    """
    # ใช้ get_line_group เพื่อให้แน่ใจว่าหาเจอเฉพาะ group ที่ active อยู่
    db_line_group = get_line_group(db, line_group_id)
    
    # กำหนดค่า deleted_at เพื่อลบข้อมูลแบบ soft delete
    db_line_group.deleted_at = datetime.now(timezone.utc)
    db.add(db_line_group)
    db.commit()
    db.refresh(db_line_group)
    return db_line_group