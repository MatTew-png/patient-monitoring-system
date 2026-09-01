from datetime import datetime, timezone
from typing import List
from fastapi import Depends, HTTPException, UploadFile, File
from models.base import get_db
from models.beds import Bed
from models.floors import Floor
from models.patient import Patient
from models.rooms import Room
from models.log_bed_patient_sensor import Log_Bed_Patient_Sensor
from models.sensors import Sensor
from schemas.patient import PatientCreate
from sqlalchemy.orm import Session, joinedload, selectinload
from services.image_service import save_image

# Create patient
def create_patient(patient: PatientCreate, db: Session = Depends(get_db)):
    db_patients = Patient(**patient.model_dump())
    db.add(db_patients)
    db.commit()
    db.refresh(db_patients)
    return db_patients

# Read all patients (ปรับปรุงให้กรอง soft deleted)
def get_patients(db: Session = Depends(get_db)) -> List[Patient]:
    patients = db.query(Patient).filter(Patient.deleted_at.is_(None)).all() # เพิ่ม filter
    return patients

# Read a single patient (ปรับปรุงให้กรอง soft deleted)
def get_patient(patient_id: int, db: Session = Depends(get_db)) -> Patient:
    patient = db.query(Patient).filter(
        Patient.patient_id == patient_id,
        Patient.deleted_at.is_(None) # เพิ่ม filter
    ).first()
    if patient is None:
        raise HTTPException(status_code=404, detail=f"Patient with id {patient_id} not found or has been deleted")
    return patient

# Update patient (ควรตรวจสอบว่า patient ยังไม่ถูก soft delete ก่อน update)
def update_patient(patient_id: int, patient: PatientCreate, db: Session = Depends(get_db)) -> Patient:
    db_patient_model = db.query(Patient).filter(
        Patient.patient_id == patient_id,
        Patient.deleted_at.is_(None) # ตรวจสอบว่ายังไม่ถูกลบ
    ).first()
    if db_patient_model is None:
        raise HTTPException(status_code=404, detail=f"Patient with id {patient_id} not found, already deleted, or does not exist for update")
    
    for key, value in patient.model_dump(exclude_unset=True).items():
        setattr(db_patient_model, key, value)
    db.commit()
    db.refresh(db_patient_model)
    return db_patient_model

# Update patient partial
def update_patient_partial(patient_id: int, patient: PatientCreate, db: Session = Depends(get_db)):
    db_patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if db_patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    for key, value in patient.model_dump(exclude_unset=True).items():
        setattr(db_patient, key, value)
    db.commit()
    db.refresh(db_patient)
    return db_patient

# Delete patient
def delete_patient(patient_id: int, db: Session = Depends(get_db)):
    db_patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if db_patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    db.delete(db_patient)
    db.commit()
    return {"message": "Patient deleted"}


# Get all patients waiting (ปรับปรุงให้กรอง soft deleted)
def get_all_patient_wait(db: Session = Depends(get_db)) -> List[Patient]:
    patients = (
        db.query(Patient)
        .outerjoin(Bed, Bed.patient_id == Patient.patient_id)
        .filter(Patient.deleted_at.is_(None)) # กรอง Patient ที่ยังไม่ถูกลบ
        .filter(Bed.patient_id.is_(None))
        .all()
    )
    return patients


# Get a single patient with full nested details (beds, room, floor, building)
def get_patient_with_full_details(patient_id: int, db: Session) -> Patient | None:
    patient = (
        db.query(Patient)
        .options(
            joinedload(Patient.bed)
                .joinedload(Bed.room)
                .joinedload(Room.floor)
                .joinedload(Floor.building)
        )
        .filter(
            Patient.patient_id == patient_id,
            Patient.deleted_at.is_(None)
        )
        .first()
    )
    return patient





def get_all_patients_with_full_details(db: Session) -> List[Patient]: # รับ db session เป็น argument โดยตรง
    patients_list = ( # เปลี่ยนชื่อตัวแปรเล็กน้อยเพื่อความชัดเจน
        db.query(Patient)
        .options(
            joinedload(Patient.bed)
            .joinedload(Bed.room)
            .joinedload(Room.floor)
            .joinedload(Floor.building)
        )
        .filter(Patient.deleted_at.is_(None)) # เพิ่ม filter
        .all()
    )
    # เพิ่ม debug print เพื่อตรวจสอบข้อมูลที่ SQLAlchemy โหลดมา (เอาออกเมื่อ production)
    # for p_item in patients_list:
    # print(f"CRUD DEBUG (All - Full Details): Patient ID {p_item.patient_id}, Bed count: {len(p_item.bed) if p_item.bed else 0}")
    # if p_item.bed:
    # for b_item in p_item.bed:
    # print(f"  CRUD DEBUG: Bed ID: {b_item.bed_id}, Room: {b_item.room}")
    # # ... สามารถ print nested attributes อื่นๆ ต่อได้ ...
    return patients_list

# Soft Delete patient
def softdelete_patient(patient_id: int, db: Session = Depends(get_db)) -> dict:
    db_patient_model = db.query(Patient).filter(
        Patient.patient_id == patient_id,
        Patient.deleted_at.is_(None) # ตรวจสอบว่ายังไม่ถูกลบไปแล้ว
    ).first()
    if db_patient_model is None:
        raise HTTPException(status_code=404, detail=f"Patient with id {patient_id} not found or already deleted")
    
    # ตั้งค่า deleted_at เป็นเวลาปัจจุบัน (UTC แนะนำ)
    db_patient_model.deleted_at = datetime.now(timezone.utc)
    
    # (ทางเลือก) ยกเลิกการเชื่อมโยงผู้ป่วยออกจากเตียงปัจจุบัน
    # หาก Patient.bed เป็น one-to-many และต้องการเคลียร์ patient_id จากทุกเตียงที่เกี่ยวข้อง
    # หรือถ้า Patient.bed เป็น one-to-one/many-to-one และต้องการเคลียร์ patient_id จากเตียงนั้น
    # ตัวอย่าง (ถ้า patient.bed เป็น list):
    # for bed_record in db_patient_model.bed:
    #     if bed_record.patient_id == patient_id: # ตรวจสอบอีกครั้งเพื่อความปลอดภัย
    #         bed_record.patient_id = None
    #         db.add(bed_record)
    # หรือถ้า patient มี current_bed attribute ที่ชัดเจน:
    # current_bed = db.query(Bed).filter(Bed.patient_id == patient_id).first()
    # if current_bed:
    #     current_bed.patient_id = None
    #     db.add(current_bed)

    db.commit()
    # ไม่จำเป็นต้อง db.refresh(db_patient_model) เพราะเราไม่ได้ต้องการข้อมูลที่เพิ่งอัปเดตกลับไปใน response นี้
    return {"message": f"Patient with id {patient_id} marked as deleted successfully"}

# Upload image
def upload_image(patient_id: int, db: Session, file: UploadFile = File(...)):
    patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    image_path = save_image(file, sub_dir="patients")
    patient.image_path = image_path
    db.commit()

    return {"message": "Uploaded successfully", "image_url": image_path}

# Get patient information
def get_patient_information(patient_id: int, db: Session, bed_id: int = None, sensor_id: int = None):
    patient = (
        db.query(Patient)
        .options(
            selectinload(Patient.log_bed_patient_sensor)
                .selectinload(Log_Bed_Patient_Sensor.bed)
                .selectinload(Bed.room)
                .selectinload(Room.floor)
                .selectinload(Floor.building),
            selectinload(Patient.log_bed_patient_sensor)
                .selectinload(Log_Bed_Patient_Sensor.sensor)
                .selectinload(Sensor.history_value_sensor),
            selectinload(Patient.log_bed_patient_sensor)
                .selectinload(Log_Bed_Patient_Sensor.notifications)       
        )
        .filter(
            Patient.patient_id == patient_id,
            Patient.deleted_at.is_(None)
        )
        .first()
    )
    
    if not patient:
        return {"error": "Patient not found"}

    result = {
        "patient_id": patient.patient_id,
        "beds": []
    }

    # วนทุก log_bed_patient_sensor
    for lbps in patient.log_bed_patient_sensor:
        # filter ตาม bed_id, sensor_id ถ้ามีส่งมา
        if bed_id is not None and lbps.bed_id != bed_id:
            continue
        if sensor_id is not None and lbps.sensor_id != sensor_id:
            continue

        bed_data = {
            "bed_id": lbps.bed.bed_id,
            "room": {
                "room_id": lbps.bed.room.room_id,
                "floor": {
                    "floor_id": lbps.bed.room.floor.floor_id,
                    "building": {
                        "building_id": lbps.bed.room.floor.building.building_id,
                        "building_name": lbps.bed.room.floor.building.building_name
                    }
                }
            },
            "sensors": [
                {
                    "sensor_id": lbps.sensor.sensor_id,
                    "sensor_type": lbps.sensor.sensor_type,
                    "history_value_sensor": [
                        {
                            "history_value_sensor_id": hv.history_value_sensor_id,
                            "value": hv.history_value_sensor_value,
                            "time": hv.history_value_sensor_time
                        }
                        for hv in lbps.sensor.history_value_sensor
                    ]
                }
            ],
            "log_bed_patient_sensor": {
                "log_bed_patient_sensor_id": lbps.log_bed_patient_sensor_id,
                "notifications": [
                    {
                        "notification_id": n.notification_id,
                        "category": n.notification_category
                    }
                    for n in lbps.notifications
                    if n.log_bed_patient_sensor.patient_id == patient_id
                    and n.log_bed_patient_sensor.bed_id == lbps.bed_id
                    and n.log_bed_patient_sensor.sensor_id == lbps.sensor_id
                ]
            }
        }

        result["beds"].append(bed_data)

    return result
