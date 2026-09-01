from datetime import date
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from models import notifications as models
from schemas import notifications as schemas
from models.base import SessionLocal, get_db
import crud.notifications as crud

router = APIRouter(
    prefix="/notifications",
    tags=["notifications"],
    responses={404: {"description": "Not found"}},
)

# ✅ GET all notifications
@router.get("/", response_model=list[schemas.NotificationResponse])
def get_notifications(db: Session = Depends(get_db)):
    return "หัวข้อ"

# ✅ GET a single notification by ID
@router.get("/{notification_id}", response_model=schemas.NotificationResponse)
def get_notification(notification_id: int, db: Session = Depends(get_db)):
    return crud.get_notification(notification_id, db)

# ✅ CREATE a new notification
@router.post("/", response_model=schemas.NotificationResponse)
def create_notification(notification: schemas.NotificationCreate, db: Session = Depends(get_db)):
    return crud.create_notification(notification, db)

# ✅ UPDATE a notification
@router.put("/{notification_id}", response_model=schemas.NotificationResponse)
def update_notification(notification_id: int, notification: schemas.NotificationCreate, db: Session = Depends(get_db)):
    return crud.update_notification(notification_id, notification, db)

# ✅ DELETE a notification
@router.delete("/{notification_id}")
def delete_notification(notification_id: int, db: Session = Depends(get_db)):
    return crud.delete_notification(notification_id, db)

# ✅ GET All Notifications by patient_id and sensor_id
@router.get("/patient/{patient_id}/sensor/{sensor_id}", response_model=list[schemas.NotificationResponse])
def get_notifications_by_patient(patient_id: int, sensor_id: int, db: Session = Depends(get_db)):
    notifications = crud.get_all_notifications_by_patient(db, patient_id, sensor_id)
    if not notifications:
        raise HTTPException(status_code=404, detail=f"No notifications found for patient_id={patient_id}, sensor_id={sensor_id}")
    return notifications


@router.get("/notifications_not_accepted/emergency", response_model=list[schemas.NotificationWarnResponse])
def get_emergency_notifications_not_accepted(db: Session = Depends(get_db)):
    return crud.get_emergency_notifications_not_accepted(db)

@router.get("/notifications_not_successed/emergency", response_model=list[schemas.NotificationWarnResponse])
def get_emergency_notifications_not_accepted(db: Session = Depends(get_db)):
    return crud.get_emergency_notifications_not_successed(db)

@router.patch("/notifications_accepted_emer/{notification_id}")
def accept_notification_emer(notification_id: int, db: Session = Depends(get_db)):
    return crud.accept_notification_emer(db, notification_id)

@router.patch("/notifications_success_emer/{notification_id}")
def success_notification_emer(notification_id: int, db: Session = Depends(get_db)):
    return crud.success_notification_emer(db, notification_id)

@router.get("/notifications_not_accepted/sos", response_model=list[schemas.NotificationWarnResponse])
def get_sos_notifications_not_accepted(db: Session = Depends(get_db)):
    return crud.get_sos_notifications_not_accepted(db)

@router.get("/notifications_not_successed/sos", response_model=list[schemas.NotificationWarnResponse])
def get_sos_notifications_not_accepted(db: Session = Depends(get_db)):
    return crud.get_sos_notifications_not_successed(db)

@router.patch("/notifications_accepted_sos/{notification_id}")
def accept_notification_sos(notification_id: int, db: Session = Depends(get_db)):
    return crud.accept_notification_sos(db, notification_id)

@router.patch("/notifications_success_sos/{notification_id}")
def success_notification_sos(notification_id: int, db: Session = Depends(get_db)):
    return crud.success_notification_sos(db, notification_id)


@router.get("/by_date_range/", response_model=List[schemas.NotificationWarnResponse]) # หรือ NotificationResponse
async def read_notifications_by_date_range(
    start_date: date = Query(..., description="Start date in YYYY-MM-DD format"), # ใช้ Query parameter
    end_date: date = Query(..., description="End date in YYYY-MM-DD format"),   # ใช้ Query parameter
    skip: int = Query(0, ge=0, description="Number of records to skip for pagination"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"), # จำกัด limit
    db: Session = Depends(get_db)
):
    """
    Retrieve notifications within a specified date range (inclusive).
    Dates should be in YYYY-MM-DD format.
    """
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="Start date cannot be after end date.")
    
    notifications = crud.get_notifications_by_date_range(
        db=db, start_date=start_date, end_date=end_date, skip=skip, limit=limit
    )
    if not notifications and skip == 0: # ถ้าไม่เจอเลย และไม่ได้ skip มา
        # อาจจะ return list ว่าง หรือ raise 404 ก็ได้ ขึ้นอยู่กับความต้องการ
        # raise HTTPException(status_code=404, detail="No notifications found for the given date range.")
        return []
    return notifications

@router.post("/warning/")
async def createWarningNotifications(warning_data:schemas.NotificationCreateWarning,db:Session = Depends(get_db)):
    result = crud.createWarningNotifications(db,warning_data)
    return result
