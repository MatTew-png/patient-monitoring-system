from datetime import datetime, timezone
from typing import List, Optional
from fastapi import Depends, HTTPException
from models.base import get_db
from sqlalchemy.orm import Session, selectinload, with_loader_criteria
from sqlalchemy import select
from models.floors import Floor
from models.rooms import Room
from models.wards import Ward
from models.beds import Bed
from schemas.buildings import BuildingCreate, FloorCreateForBuilding
from models.buildings import Building
from schemas import floors as schemas_floor
from io import StringIO
import csv
from fastapi import HTTPException, status
import re

# Create building
def create_building(building_create_data: BuildingCreate, db: Session = Depends(get_db)):
    existing = db.query(Building).filter(
        Building.building_name == building_create_data.building_name,
        Building.deleted_at.is_(None)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Building name already exists"
        )
    db_buildings = Building(**building_create_data.model_dump())
    db.add(db_buildings)
    db.commit()
    db.refresh(db_buildings)
    return db_buildings

# Read buildings
def get_buildings(db: Session = Depends(get_db)):
    buildings = db.query(Building).options(
        selectinload(Building.floor).selectinload(Floor.room)
    ).filter(Building.deleted_at.is_(None)).all()

    # Filer floors and rooms that were soft-deleted
    for building in buildings:
        building.floor = [floor for floor in building.floor if floor.deleted_at is None]
        building.floor.sort(
            key=lambda f: int(re.search(r"\d+", f.floor_name).group())
            if re.search(r"\d+", f.floor_name)
            else float("inf")  # ถ้าไม่มีตัวเลข เช่น "ดาดฟ้า" จะอยู่ท้ายสุด
        )
        for floor in building.floor:
            floor.room = [room for room in floor.room if room.deleted_at is None]
            floor.room.sort(key=lambda r: r.room_name)
    
    # Return the list of buildings
    if not buildings:
        raise HTTPException(status_code=404, detail="No buildings found")
    return buildings

# Read building
def get_building(building_id: int, db: Session = Depends(get_db)):
    building = db.query(Building).filter(Building.building_id == building_id,Building.deleted_at.is_(None)).first()
    if building is None:
        raise HTTPException(status_code=404, detail="Building not found")
    return building

# Update building
def update_building(building_id: int, building: BuildingCreate, db: Session = Depends(get_db)):
    db_building = db.query(Building).filter(Building.building_id == building_id).first()
    if db_building is None:
        raise HTTPException(status_code=404, detail="Building not found")
    for key, value in building.model_dump().items():
        setattr(db_building, key, value)
    db.commit()
    db.refresh(db_building)
    return db_building

# Delete building
def softdelete_building(building_id: int, db: Session = Depends(get_db)) -> dict:
    db_building_model = db.query(Building).filter(
        Building.building_id == building_id,
        Building.deleted_at.is_(None)
    ).first()

    if db_building_model is None:
        raise HTTPException(status_code=404, detail=f"Building with id {building_id} not found or already deleted")

    db_building_model.deleted_at = datetime.now(timezone.utc)

    print(f"INFO: Building {db_building_model.building_id} has been marked as deleted.")

    db.commit()
    return {"message": f"Building with id {building_id} marked as deleted successfully"}


def create_building_and_floors(
    db: Session,
    building_data: BuildingCreate,
    floor_count: int
) -> Building:
    existing = (
        db.query(Building)
        .filter(
            Building.building_name == building_data.building_name,
            Building.deleted_at.is_(None)
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Building name already exists"
        )

    db_building = Building(**building_data.model_dump())
    db.add(db_building)

    try:
        db.flush()  # ให้มี building_id โดยยังไม่ commit
        for i in range(floor_count):
            db.add(Floor(
                floor_name=f"ชั้น {i + 1}",
                building_id=db_building.building_id
            ))

        db.commit()
        db.refresh(db_building)
        return db_building

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create building and floors: {str(e)}"
        )
    


def update_building_and_floors(
    db: Session,
    building_id: int,
    building_name: str,
    floor_count: int
):
    building = db.query(Building).filter_by(building_id=building_id).first()
    if not building:
        raise HTTPException(status_code=404, detail="Building not found")

    building.building_name = building_name
    db.commit()

    existing_floors = db.query(Floor).filter_by(building_id=building_id).all()
    current_count = len(existing_floors)

    if floor_count > current_count:
        for i in range(current_count + 1, floor_count + 1):
            new_floor = Floor(floor_name=f"ชั้น {i}", building_id=building_id)
            db.add(new_floor)
    elif floor_count < current_count:
        floors_to_delete = existing_floors[floor_count:]
        for floor in floors_to_delete:
            db.delete(floor)

    db.commit()
    db.refresh(building)
    return building

def import_location_from_csv(file_data: bytes, db: Session = Depends(get_db)):
    decoded = file_data.decode("utf-8-sig")
    reader = csv.DictReader(StringIO(decoded))

    # cache เพื่อหลีกเลี่ยงการ query ซ้ำ
    building_cache = {}
    floor_cache = {}
    ward_cache = {}
    room_cache = {}
    bed_cache = {}

    for row in reader:
        building_name = row["building"].strip()
        floor_number = int(row["floor"])
        floor_name = f"ชั้น {floor_number}"
        room_name = str(row["room"]).strip()
        bed_name = str(row["bed"]).strip()
        ward_name = row["ward"].strip()

        # --- Building ---
        building = building_cache.get(building_name)
        if not building:
            building = db.query(Building).filter_by(building_name=building_name).first()
            if not building:
                building = Building(building_name=building_name)
                db.add(building)
                db.flush()
            elif building.deleted_at is not None:
                building.deleted_at = None
                db.add(building)
                db.flush()
            building_cache[building_name] = building

        # --- Floor ---
        floor_key = (building.building_id, floor_name)
        floor = floor_cache.get(floor_key)
        if not floor:
            floor = db.query(Floor).filter_by(floor_name=floor_name, building_id=building.building_id).first()
            if not floor:
                floor = Floor(floor_name=floor_name, building_id=building.building_id)
                db.add(floor)
                db.flush()
            floor_cache[floor_key] = floor

        # --- Ward ---
        ward = ward_cache.get(ward_name)
        if not ward:
            ward = db.query(Ward).filter_by(ward_name=ward_name).first()
            if not ward:
                ward = Ward(ward_name=ward_name)
                db.add(ward)
                db.flush()
            ward_cache[ward_name] = ward

        # --- Room ---
        room_key = (room_name, floor.floor_id, ward.ward_id)
        room = room_cache.get(room_key)
        if not room:
            room = db.query(Room).filter_by(room_name=room_name, floor_id=floor.floor_id, ward_id=ward.ward_id).first()
            if not room:
                room = Room(room_name=room_name, floor_id=floor.floor_id, ward_id=ward.ward_id)
                db.add(room)
                db.flush()
            room_cache[room_key] = room

        # --- Bed ---
        bed_key = (bed_name, room.room_id)
        bed = bed_cache.get(bed_key)
        if not bed:
            bed = db.query(Bed).filter_by(bed_name=bed_name, room_id=room.room_id).first()
            if not bed:
                bed = Bed(bed_name=bed_name, room_id=room.room_id)
                db.add(bed)
                # ไม่ต้อง flush ก็ได้ เพราะไม่ใช้ bed.id ต่อแล้ว
            bed_cache[bed_key] = bed

    db.commit()
    return {"message": "Import successful"}