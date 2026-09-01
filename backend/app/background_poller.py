# app/background_poller.py
import asyncio
from sqlalchemy.orm import Session, sessionmaker, joinedload, selectinload
from sqlalchemy import select, or_, and_
from models.base import engine
from models.history_value_sensor import History_Value_Sensor
from models.notifications import Notification
from models.log_bed_patient_sensor import Log_Bed_Patient_Sensor
from models.beds import Bed
from models.patient import Patient
from models.sensors import Sensor
from models.sensor_notifications_config import Sensor_Notifications_Config
from app.websocket_manager import manager # ตรวจสอบว่า import manager ถูกต้อง
from crud.history_value_sensor import history_to_dict
from typing import Dict, Set
from datetime import datetime # Import datetime ถ้ายังไม่มี

# Import schemas ถ้าต้องการใช้ในการ validate ตอน format (แต่ format_notification_data ใช้สร้าง dict ตรงๆ ได้)
from schemas.beds import BedOnlyResponse
from schemas.patient import PatientResponse
from schemas.sensors import SensorOnlyResponse
from schemas.sensor_notifications_config import SensorNotificationsConfigResponse


PollerSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# --- Sensor Poller (Placeholder - ใส่โค้ดเดิมของคุณ) ---
async def poll_database_for_updates(interval_seconds: int = 2):
    print(f"Starting database poller task (Sensors). Interval: {interval_seconds} seconds.")
    # ใส่โค้ด Sensor Poller เดิมของคุณที่นี่
    while True:
         # ตัวอย่าง: ต้องมี await sleep เพื่อไม่ให้ block loop
         # print("Sensor poller running...") # Debug
         await asyncio.sleep(interval_seconds)
    # pass


# --- Notification Formatting Helper ---
def format_notification_data(notification: Notification) -> dict | None:
    """Helper function แปลง Notification SQLAlchemy object เป็น Dictionary"""
    try:
        # Prepare nested structures safely, checking for None
        log_data = None
        if notification.log_bed_patient_sensor:
            log = notification.log_bed_patient_sensor
            # ใช้ .model_dump() ถ้า validate ด้วย Pydantic ก่อน หรือสร้าง dict โดยตรง
            bed_data_dict = BedOnlyResponse.model_validate(log.bed, from_attributes=True).model_dump(mode='json') if log.bed else None
            patient_data_dict = PatientResponse.model_validate(log.patient, from_attributes=True).model_dump(mode='json') if log.patient else None
            sensor_data_dict = SensorOnlyResponse.model_validate(log.sensor, from_attributes=True).model_dump(mode='json') if log.sensor else None

            log_data = {
                "log_bed_patient_sensor_id": log.log_bed_patient_sensor_id,
                "bed_id": log.bed_id,
                "patient_id": log.patient_id,
                "sensor_id": log.sensor_id,
                "log_bed_patient_sensor_date": log.log_bed_patient_sensor_date.isoformat() if log.log_bed_patient_sensor_date else None,
                "bed": bed_data_dict,
                "patient": patient_data_dict,
                "sensor": sensor_data_dict,
            }

        config_data_dict = None
        if notification.sensor_notifications_config:
            config = notification.sensor_notifications_config
            config_data_dict = SensorNotificationsConfigResponse.model_validate(config, from_attributes=True).model_dump(mode='json')

        return {
            "notification_id": notification.notification_id,
            "log_bed_patient_sensor_id": notification.log_bed_patient_sensor_id,
            "sensor_notifications_config_id": notification.sensor_notifications_config_id,
            "notification_successed": notification.notification_successed,
            "notification_category": notification.notification_category,
            "notification_accepted": notification.notification_accepted,
            "notification_createdate": notification.notification_createdate.isoformat() if notification.notification_createdate else None,
            "notification_updatedate": notification.notification_updatedate.isoformat() if notification.notification_updatedate else None,
            "log_bed_patient_sensor": log_data,
            "sensor_notifications_config": config_data_dict
        }
    except Exception as format_error:
        print(f"Error formatting notification data for ID {notification.notification_id}: {format_error}")
        return None


# --- Notification Poller (จัดรูปแบบใหม่) ---
async def poll_notifications_for_updates(interval_seconds: int = 3):
    """
    Polls for active/recently completed SOS/Emergency notifications
    and broadcasts them to the appropriate state-specific WebSocket topic.
    """
    print(f"Starting database poller task (Notifications - Detailed State v3). Interval: {interval_seconds} seconds.")
    # Cache: { notification_id: "last_broadcast_topic_string" }
    broadcast_state_cache: Dict[int, str] = {}

    while True: # <--- Level 0 (นอกสุดของฟังก์ชัน ไม่นับ)
        # Check for any active listeners (Level 1: 4 spaces)
        all_notification_topics = {
            "notifications_sos_pending", "notifications_emergency_pending",
            "notifications_sos_accepted", "notifications_emergency_accepted",
            "notifications_sos_completed", "notifications_emergency_completed"
        }
        active_notification_listeners = any(
             topic in manager.active_connections and manager.active_connections[topic]
             for topic in all_notification_topics
        )

        if not active_notification_listeners: # <--- Level 1
            await asyncio.sleep(interval_seconds) # <--- Level 2 (8 spaces)
            continue # <--- Level 2

        db: Session = PollerSessionLocal() # <--- Level 1
        current_active_notification_ids: Set[int] = set() # <--- Level 1

        try: # <--- Level 1
            # 1. Query notifications ที่ยังไม่ Success (Active) (Level 2)
            active_stmt = (
                select(Notification)
                .options( # Eager load relationships
                    selectinload(Notification.log_bed_patient_sensor).selectinload(Log_Bed_Patient_Sensor.bed),
                    selectinload(Notification.log_bed_patient_sensor).selectinload(Log_Bed_Patient_Sensor.patient),
                    selectinload(Notification.log_bed_patient_sensor).selectinload(Log_Bed_Patient_Sensor.sensor),
                    selectinload(Notification.sensor_notifications_config)
                )
                .where(
                    Notification.notification_successed == False, # << เฉพาะที่ยัง Active
                    or_(
                       Notification.notification_category == "SOS",
                       Notification.notification_category == "Emergency"
                    )
                )
                .order_by(Notification.notification_id.asc())
            )
            active_result = db.execute(active_stmt) # <--- Level 2
            active_notifications = active_result.unique().scalars().all() # <--- Level 2

            # 2. Process active notifications (Level 2)
            for notification in active_notifications: # <--- Level 2
                nid = notification.notification_id # <--- Level 3 (12 spaces)
                current_active_notification_ids.add(nid)
                current_topic: str | None = None

                # กำหนด Topic ตามสถานะปัจจุบัน (Pending หรือ Accepted)
                category = notification.notification_category
                accepted = notification.notification_accepted

                if category == "SOS": # <--- Level 3
                    current_topic = "notifications_sos_pending" if not accepted else "notifications_sos_accepted" # <--- Level 4 (16 spaces)
                elif category == "Emergency": # <--- Level 3
                    current_topic = "notifications_emergency_pending" if not accepted else "notifications_emergency_accepted" # <--- Level 4

                if not current_topic: continue # <--- Level 3

                last_broadcast_topic = broadcast_state_cache.get(nid) # <--- Level 3

                # Broadcast ถ้าเป็น ID ใหม่ หรือ สถานะ/Topic เปลี่ยนไป
                if nid not in broadcast_state_cache or last_broadcast_topic != current_topic: # <--- Level 3
                    formatted_data = format_notification_data(notification) # <--- Level 4
                    if formatted_data: # <--- Level 4
                        await manager.broadcast_json(formatted_data, current_topic) # <--- Level 5 (20 spaces)
                    # อัปเดต Cache ด้วย topic ปัจจุบัน
                    broadcast_state_cache[nid] = current_topic # <--- Level 4

            # 3. ตรวจสอบรายการที่หายไปจาก active set (อาจจะ Completed หรือ Deleted) (Level 2)
            cached_ids = set(broadcast_state_cache.keys())
            completed_or_deleted_ids = cached_ids - current_active_notification_ids

            if completed_or_deleted_ids: # <--- Level 2
                # Query สถานะสุดท้ายของ ID เหล่านี้ (Level 3)
                final_state_stmt = (
                     select(
                          Notification.notification_id,
                          Notification.notification_category,
                          Notification.notification_successed # << ตรวจสอบสถานะ successed สุดท้าย
                     )
                     .where(Notification.notification_id.in_(completed_or_deleted_ids))
                )
                final_state_result = db.execute(final_state_stmt) # <--- Level 3
                final_states = { # <--- Level 3
                    nid: {"category": cat, "successed": succ}
                    for nid, cat, succ in final_state_result.all()
                }

                for nid in completed_or_deleted_ids: # <--- Level 3
                     last_topic = broadcast_state_cache.pop(nid) # <--- Level 4
                     final_state = final_states.get(nid) # <--- Level 4

                     # ตรวจสอบว่ามัน Complete จริงหรือไม่ (successed == True)
                     if final_state and final_state["successed"] is True: # <--- Level 4
                         completed_topic: str | None = None # <--- Level 5
                         category = final_state["category"] # <--- Level 5

                         if category == "SOS": # <--- Level 5
                             completed_topic = "notifications_sos_completed" # <--- Level 6 (24 spaces)
                         elif category == "Emergency": # <--- Level 5
                             completed_topic = "notifications_emergency_completed" # <--- Level 6

                         if completed_topic: # <--- Level 5
                             # ส่ง Event แจ้งว่าเสร็จสิ้น (อาจจะส่งแค่ ID)
                             # print(f"Broadcasting NID {nid} completion to {completed_topic}") # Debug
                             await manager.broadcast_json( # <--- Level 6
                                 {"notification_id": nid, "status": "completed"},
                                 completed_topic
                             )
                     # else: (Level 4) - ถ้าต้องการ xử lý กรณีถูกลบหรือไม่ Complete
                     #    pass

        except Exception as e: # <--- Level 1 (ตรงกับ try)
            print(f"Error during detailed notifications poll cycle v3: {e}") # <--- Level 2
        finally: # <--- Level 1 (ตรงกับ try)
            # ปิด Session เสมอ (Level 2)
            db.close() # <<< ตรวจสอบบรรทัดนี้ (ต้องอยู่ใต้ finally และเยื้องเข้ามา)

        # รอรอบถัดไป (Level 1 - อยู่ใน while แต่นอก finally)
        await asyncio.sleep(interval_seconds) # <<< ตรวจสอบบรรทัดนี้ (ต้องอยู่ระดับเดียวกับ try/except/finally)