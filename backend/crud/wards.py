from datetime import datetime, timezone
from typing import List
from fastapi import Depends, HTTPException, UploadFile, File
from models.base import get_db
from models.beds import Bed
from models.floors import Floor
from models.patient import Patient
from models.rooms import Room
from models.wards import Ward
from schemas.patient import PatientCreate
from sqlalchemy.orm import Session, joinedload, selectinload
from schemas.wards import WardCreate, WardCreateWithRooms
from services.image_service import save_image



def create_ward(ward_data: WardCreateWithRooms, db: Session) -> Ward:


    new_ward = Ward(ward_name=ward_data.ward_name)
    db.add(new_ward)

    try:
      
        db.commit()
        db.refresh(new_ward)

        if ward_data.room_ids:
     
            rooms_to_update = db.query(Room).filter(Room.room_id.in_(ward_data.room_ids)).all()

   
            if len(rooms_to_update) != len(ward_data.room_ids):
                found_ids = {room.room_id for room in rooms_to_update}
                missing_ids = set(ward_data.room_ids) - found_ids
                raise HTTPException(
                    status_code=404,
                    detail=f"The following rooms were not found: {list(missing_ids)}. Cannot create ward."
                )


            for room in rooms_to_update:
                room.ward_id = new_ward.ward_id
            
         
            db.commit()

   
        db.refresh(new_ward)
        return new_ward

    except Exception as e:
 
        db.rollback()
 
        raise e


def update_ward(ward_id: int, room: WardCreateWithRooms, db: Session = Depends(get_db)):
    db_ward = db.query(Ward).filter(Ward.ward_id == ward_id).first()
    if db_ward is None:
        raise HTTPException(status_code=404, detail="Ward not found")

    db_ward.ward_name = room.ward_name

    # เคลียร์ห้องเก่า
    db.query(Room).filter(Room.ward_id == ward_id).update({Room.ward_id: None})

    # เซ็ตห้องใหม่
    db.query(Room).filter(Room.room_id.in_(room.room_ids)).update(
        {Room.ward_id: ward_id}, synchronize_session=False
    )

    db.commit()
    db.refresh(db_ward)
    return db_ward

def softdelete_ward(ward_id: int, db: Session = Depends(get_db)) -> dict:
    db_ward_model = db.query(Ward).filter(
        Ward.ward_id == ward_id,
        Ward.deleted_at.is_(None) 
    ).first()
    if db_ward_model is None:
        raise HTTPException(status_code=404, detail=f"Ward with id {ward_id} not found or already deleted")
    

    db_ward_model.deleted_at = datetime.now(timezone.utc)
    
    if db_ward_model.ward_id is not None:
        print(f"INFO: Ward {db_ward_model.ward_id} is being unassigned from soft-deleted bed {ward_id}.")
        

    db.commit()
    return {"message": f"Ward with id {ward_id} marked as deleted successfully"}





def get_ward_with_full_details(ward_id: int, db: Session) -> Ward | None:
    ward = (
        db.query(Ward)
        .options(
            joinedload(Ward.room)
                .joinedload(Room.floor)
                .joinedload(Floor.building)
            ,
            joinedload(Ward.user)
        )
        .filter(
            Ward.ward_id == ward_id,
            Ward.deleted_at.is_(None)
        )
        .first()
    )
    return ward





def get_all_wards_with_full_details(db: Session) -> List[Ward]: 
    wards_list = ( 
        db.query(Ward)
        .options(
            joinedload(Ward.room)
                .joinedload(Room.floor)
                .joinedload(Floor.building)
            ,
            joinedload(Ward.user)
        )
        .filter(Ward.deleted_at.is_(None)) 
        .all()
    )
    return wards_list