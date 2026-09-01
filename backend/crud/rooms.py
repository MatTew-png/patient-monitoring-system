from datetime import datetime, timezone
from fastapi import Depends, HTTPException
from models.base import get_db
from sqlalchemy.orm import Session, joinedload
from models.rooms import Room
from models.floors import Floor
from schemas.rooms import RoomCreate
from sqlalchemy import select
import re

# Create room
def create_room(room: RoomCreate, db: Session = Depends(get_db)):
    db_rooms = Room(**room.model_dump())
    db.add(db_rooms)
    db.commit()
    db.refresh(db_rooms)
    return db_rooms

# Get rooms that are not assigned to any ward
def get_rooms_free(db: Session):
    unassigned_rooms = db.query(Room).options(
        joinedload(Room.floor)
    ).filter(
        Room.ward_id.is_(None),
        Room.deleted_at.is_(None)
    ).all()
    return unassigned_rooms



# Read rooms
def get_rooms(db: Session = Depends(get_db)):
    rooms = db.query(Room).options(
        joinedload(Room.ward),
        joinedload(Room.floor)
    ).filter(
        Room.deleted_at.is_(None)
    ).all()
    return rooms

# Read room
def get_room(room_id: int, db: Session = Depends(get_db)):
    room = db.query(Room).options(
         joinedload(Room.ward),
         joinedload(Room.floor) 
    ).filter(Room.room_id == room_id,Room.deleted_at.is_(None)).first()
    if room is None:
        raise HTTPException(status_code=404, detail="Room not found")
    return room

# Update room
def update_room(room_id: int, room: RoomCreate, db: Session = Depends(get_db)):
    db_room = db.query(Room).filter(Room.room_id == room_id).first()
    if db_room is None:
        raise HTTPException(status_code=404, detail="Room not found")
    for key, value in room.model_dump().items():
        setattr(db_room, key, value)
    db.commit()
    db.refresh(db_room)
    return db_room

# Delete room
def softdelete_room(room_id: int, db: Session = Depends(get_db)) -> dict:
    db_room_model = db.query(Room).filter(
        Room.room_id == room_id,
        Room.deleted_at.is_(None)  # ตรวจสอบว่ายังไม่ได้ถูก soft-deleted
    ).first()

    if db_room_model is None:
        raise HTTPException(status_code=404, detail=f"Room with id {room_id} not found or already deleted")

    db_room_model.deleted_at = datetime.now(timezone.utc)

    print(f"INFO: Room {db_room_model.room_id} has been marked as deleted.")

    db.commit()
    return {"message": f"Room with id {room_id} marked as deleted successfully"}

# Create room by number of rooms

def create_rooms_batch(room: RoomCreate, db: Session):
    # 1. Query floor ที่เลือกมา
    floor = db.query(Floor).filter(Floor.floor_id == room.floor_id).first()
    if not floor:
        raise HTTPException(status_code=404, detail="Floor not found")

    # 2. ดึงเลขชั้นจริงจาก floor_name (ตัดตัวเลขออกมา)
    match = re.search(r"\d+", floor.floor_name)
    if not match:
        raise HTTPException(status_code=400, detail="Invalid floor_name format")
    floor_number = int(match.group())
    floor_number_str = str(floor_number)

    # 3. Query ห้องทั้งหมดใน floor นี้ (ที่ยังไม่ถูกลบ)
    stmt = select(Room).where(Room.floor_id == room.floor_id, Room.deleted_at == None)
    existing_rooms = db.execute(stmt).scalars().all()

    # 4. กรองห้องที่ base_name ตรงกับ input
    same_name_rooms = []
    for r in existing_rooms:
        parts = r.room_name.rsplit(" ", 1)
        if len(parts) == 2 and parts[0] == room.room_name:
            same_name_rooms.append(r)

    # 5. หาเลขห้องสูงสุด และเก็บ index ที่มีอยู่
    max_room_num = 0
    existing_indices = set()
    for r in same_name_rooms:
        try:
            room_number = int(r.room_name.rsplit(" ", 1)[1])
            room_index = int(str(room_number)[len(floor_number_str):])
            existing_indices.add(room_index)
            max_room_num = max(max_room_num, room_index)
        except Exception:
            continue

    # 6. คำนวณช่องโหว่ (holes)
    holes = []
    if max_room_num > 0:
        for idx in range(1, max_room_num + 1):
            if idx not in existing_indices:
                full_room_num = int(f"{floor_number}{idx:02d}")
                holes.append(full_room_num)

    # ✅ 7. เริ่มสร้างห้องใหม่ โดยเติมช่องโหว่ก่อน
    new_rooms = []
    remaining = room.room_count  # จำนวนห้องที่ต้องการสร้าง

    # เติมช่องโหว่ก่อน
    for hole_room_num in holes:
        if remaining <= 0:
            break

        full_room_name = f"{room.room_name} {hole_room_num}"
        new_room = Room(
            room_name=full_room_name,
            floor_id=room.floor_id,
            ward_id=room.ward_id,
        )
        db.add(new_room)
        new_rooms.append(new_room)
        remaining -= 1

    # ถ้ายังเหลือจำนวนห้องที่ต้องสร้าง → สร้างต่อจาก max_room_num
    if remaining > 0:
        for i in range(1, remaining + 1):
            next_index = max_room_num + i
            room_number = int(f"{floor_number}{next_index:02d}")
            full_room_name = f"{room.room_name} {room_number}"

            new_room = Room(
                room_name=full_room_name,
                floor_id=room.floor_id,
                ward_id=room.ward_id,
            )
            db.add(new_room)
            new_rooms.append(new_room)

    # ✅ Commit และ refresh
    db.commit()
    if new_rooms:
        db.refresh(new_rooms[-1])


    return new_rooms




