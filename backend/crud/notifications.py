from datetime import date, datetime, time, timedelta
from typing import List
from models import log_bed_patient_sensor
from models.rooms import Room
from models.wards import Ward
from models.line_group import Line_Group
from sqlalchemy.orm import Session, joinedload
from fastapi import Depends, HTTPException
from models.notifications import Notification
from models.sensors import Sensor
from models.sensor_notifications_config import Sensor_Notifications_Config
from models.beds import Bed
from models.log_bed_patient_sensor import Log_Bed_Patient_Sensor
from routes.beds import get_db
from schemas.notifications import NotificationCreate,NotificationCreateWarning
from sqlalchemy.orm import Session, selectinload ,subqueryload, with_loader_criteria
from models.notifications import Notification
from models.log_bed_patient_sensor import Log_Bed_Patient_Sensor # และ models อื่นๆ ถ้าต้องใช้ตอน format
from app.background_poller import format_notification_data # ใช้ helper เดิม
import operator
from crud.sensors import update_history as UpdateSensorVerify
#from app.lineNotificationGroupTarget import create_flex_message,send_line_flex_message


# ✅ Function to convert Datetime to ISO 8601 format
def format_datetime(value):
    if isinstance(value, datetime):
        return value.isoformat()  # ✅ แปลงเป็น "YYYY-MM-DDTHH:MM:SS"
    return value  # ถ้าไม่ใช่ datetime ให้คืนค่าเดิม

# ✅ GET All Notifications
def get_notifications(db: Session):
    return db.query(Notification).options(joinedload(Notification.sensor_notifications_config)).all()

# ✅ GET Notification by ID
def get_notification(notification_id: int, db: Session):
    notification = (
        db.query(Notification)
        .filter(Notification.notification_id == notification_id)
        .options(joinedload(Notification.sensor_notifications_config))
        .first()
    )
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification

# ✅ CREATE Notification
def create_notification(notification: NotificationCreate, db: Session):
    new_notification = Notification(**notification.model_dump())
    db.add(new_notification)
    db.commit()
    db.refresh(new_notification)
    return new_notification

# ✅ UPDATE Notification
def update_notification(notification_id: int, notification: NotificationCreate, db: Session):
    db_notification = db.query(Notification).filter(Notification.notification_id == notification_id).first()
    if not db_notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    for key, value in notification.model_dump(exclude_unset=True).items():
        setattr(db_notification, key, value)

    db.commit()
    db.refresh(db_notification)
    return db_notification

# ✅ DELETE Notification
def delete_notification(notification_id: int, db: Session):
    db_notification = db.query(Notification).filter(Notification.notification_id == notification_id).first()
    if not db_notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    db.delete(db_notification)
    db.commit()
    return {"message": "Notification deleted"}

# ✅ GET All Notifications by Patient and Sensor
def get_all_notifications_by_patient(db: Session, patient_id: int, sensor_id: int):
    query = (
        db.query(Notification)
        .join(Sensor_Notifications_Config, Notification.sensor_notifications_config_id == Sensor_Notifications_Config.sensor_notifications_config_id)
        .join(Sensor, Sensor_Notifications_Config.sensor_id == Sensor.sensor_id)
        .outerjoin(Bed, Sensor.bed_id == Bed.bed_id)
        .outerjoin(Log_Bed_Patient_Sensor, Bed.bed_id == Log_Bed_Patient_Sensor.bed_id)
        .filter(Log_Bed_Patient_Sensor.patient_id == patient_id)
        .filter(Sensor.sensor_id == sensor_id)
        .options(joinedload(Notification.sensor_notifications_config))
    )

    result = query.all()

    if not result:
        print(f"❌ No Notifications found for patient_id={patient_id}, sensor_id={sensor_id}")
        print(f"SQL Query: {str(query)}")  

    # แปลงผลลัพธ์เป็น dict และลบ sensor ออกจาก sensor_notifications_config
    notifications_list = []
    for notification in result:
        notification_dict = notification.__dict__.copy()
        if "sensor_notifications_config" in notification_dict:
            notification_dict["sensor_notifications_config"] = notification_dict["sensor_notifications_config"].__dict__.copy()
            notification_dict["sensor_notifications_config"].pop("sensor", None)  # ลบ sensor ถ้ามี

        notifications_list.append(notification_dict)

    return notifications_list


def get_emergency_notifications_not_accepted(db: Session):
    notifications = db.query(Notification).filter(
        Notification.notification_accepted == False,
        Notification.notification_category == "Emergency",
        Notification.notification_successed == False
    ).options(joinedload(Notification.sensor_notifications_config), 
              joinedload(Notification.log_bed_patient_sensor)).all()
    
    return notifications

def get_emergency_notifications_not_successed(db: Session):
    notifications = db.query(Notification).filter(
        Notification.notification_accepted == True,
        Notification.notification_category == "Emergency",
        Notification.notification_successed == False
    ).options(joinedload(Notification.sensor_notifications_config), 
              joinedload(Notification.log_bed_patient_sensor)).all()
    
    return notifications

def accept_notification_emer(db: Session, notification_id: int):
    notification = db.query(Notification).filter(
        Notification.notification_id == notification_id,
        Notification.notification_category == "Emergency",
        Notification.notification_successed == False
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Emergency notification not found or not an Emergency category or Emergency notification already succeeded")
    
    notification.notification_accepted = True
    db.commit()
    db.refresh(notification)
    
    return {"message": "Notification accepted", "notification_id": notification_id}

def success_notification_emer(db: Session, notification_id: int):
    notification = db.query(Notification).filter(
        Notification.notification_id == notification_id,
        Notification.notification_category == "Emergency",
        Notification.notification_accepted == True
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Emergency notification not found or not an Emergency category or Emergency notification not accepted")
    
    notification.notification_successed = True
    db.commit()
    db.refresh(notification)
    
    return {"message": "Notification successed", "notification_id": notification_id}


def get_sos_notifications_not_accepted(db: Session):
    notifications = db.query(Notification).filter(
        Notification.notification_accepted == False,
        Notification.notification_category == "SOS",
        Notification.notification_successed == False
    ).options(joinedload(Notification.sensor_notifications_config), 
              joinedload(Notification.log_bed_patient_sensor)).all()
    
    return notifications

def get_sos_notifications_not_successed(db: Session):
    notifications = db.query(Notification).filter(
        Notification.notification_accepted == True,
        Notification.notification_category == "SOS",
        Notification.notification_successed == False
    ).options(joinedload(Notification.sensor_notifications_config), 
              joinedload(Notification.log_bed_patient_sensor)).all()
    
    return notifications

def accept_notification_sos(db: Session, notification_id: int):
    notification = db.query(Notification).filter(
        Notification.notification_id == notification_id,
        Notification.notification_category == "SOS",
        Notification.notification_successed == False
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="SOS notification not found or not an SOS category or SOS notification already succeeded")
    
    notification.notification_accepted = True
    db.commit()
    db.refresh(notification)
    
    return {"message": "Notification accepted", "notification_id": notification_id}

def success_notification_sos(db: Session, notification_id: int):
    notification = db.query(Notification).filter(
        Notification.notification_id == notification_id,
        Notification.notification_category == "SOS",
        Notification.notification_accepted == True
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="SOS notification not found or not an SOS category or SOS notification not accepted")
    
    notification.notification_successed = True
    db.commit()
    db.refresh(notification)
    
    return {"message": "Notification successed", "notification_id": notification_id}


# สร้างฟังก์ชันสำหรับแต่ละสถานะ
def get_current_notifications(db: Session):
    notifications = db.query(Notification).options(
        selectinload(Notification.log_bed_patient_sensor), # โหลดข้อมูลที่จำเป็นสำหรับ format
        selectinload(Notification.sensor_notifications_config)
    ).all()
    return [format_notification_data(n) for n in notifications if n]

def get_current_sos_pending(db: Session):
    notifications = db.query(Notification).options(
        selectinload(Notification.log_bed_patient_sensor), # โหลดข้อมูลที่จำเป็นสำหรับ format
        selectinload(Notification.sensor_notifications_config)
    ).filter(
        Notification.notification_category == "SOS",
        Notification.notification_accepted == False,
        Notification.notification_successed == False
    ).all()
    return [format_notification_data(n) for n in notifications if n]

def get_current_emergency_pending(db: Session):
    notifications = db.query(Notification).options(
         selectinload(Notification.log_bed_patient_sensor),
         selectinload(Notification.sensor_notifications_config)
    ).filter(
        Notification.notification_category == "Emergency",
        Notification.notification_accepted == False,
        Notification.notification_successed == False
    ).all()
    return [format_notification_data(n) for n in notifications if n]

def get_current_sos_accepted(db: Session):
    notifications = db.query(Notification).options(
         selectinload(Notification.log_bed_patient_sensor),
         selectinload(Notification.sensor_notifications_config)
    ).filter(
        Notification.notification_category == "SOS",
        Notification.notification_accepted == True,
        Notification.notification_successed == False
    ).all()
    return [format_notification_data(n) for n in notifications if n]

def get_current_emergency_accepted(db: Session):
    notifications = db.query(Notification).options(
         selectinload(Notification.log_bed_patient_sensor),
         selectinload(Notification.sensor_notifications_config)
    ).filter(
        Notification.notification_category == "Emergency",
        Notification.notification_accepted == True,
        Notification.notification_successed == False
    ).all()
    return [format_notification_data(n) for n in notifications if n]

# อาจจะไม่ต้องมีสำหรับ completed เพราะปกติจะสนใจ event ที่เปลี่ยนเป็น completed มากกว่า


def get_notifications_by_date_range(
    db: Session,
    start_date: date,
    end_date: date,
    skip: int = 0, # เพิ่ม pagination (optional)
    limit: int = 100 # เพิ่ม pagination (optional)
) -> List[Notification]:
    """
    ดึงข้อมูล Notifications ภายในช่วงวันที่ที่กำหนด (ตาม notification_createdate)
    โดย end_date จะถูกรวมอยู่ในช่วงการค้นหา (inclusive)
    """
    # แปลง end_date ให้เป็น datetime ณ สิ้นสุดของวันนั้น (23:59:59.999999)
    # เพื่อให้ครอบคลุม notification ทั้งหมดที่เกิดขึ้นใน end_date
    end_datetime = datetime.combine(end_date, time.max)
    # start_date สามารถใช้เป็น datetime ณ จุดเริ่มต้นของวันได้เลย
    start_datetime = datetime.combine(start_date, time.min)

    query = (
        db.query(Notification)
        .filter(
            Notification.notification_createdate >= start_datetime,
            Notification.notification_createdate <= end_datetime
        )
        .options( # Eager load ข้อมูลที่เกี่ยวข้องถ้าต้องการ (เหมือนใน get_emergency_notifications_not_accepted)
            selectinload(Notification.log_bed_patient_sensor)
            .selectinload(Log_Bed_Patient_Sensor.bed),
            selectinload(Notification.log_bed_patient_sensor)
            .selectinload(Log_Bed_Patient_Sensor.patient),
            selectinload(Notification.log_bed_patient_sensor)
            .selectinload(Log_Bed_Patient_Sensor.sensor),
            selectinload(Notification.sensor_notifications_config)
        )
        .order_by(Notification.notification_createdate.desc()) # เรียงจากล่าสุดไปเก่าสุด (optional)
        .offset(skip) # สำหรับ pagination
        .limit(limit) # สำหรับ pagination
    )
    notifications = query.all()
    return notifications


# map for math operation
op_map = {
    ">": operator.gt,
    "<": operator.lt,
    "==": operator.eq,
    ">=": operator.ge,
    "<=": operator.le,
    "!=": operator.ne
}

# function for cast sensor value to int
def smart_cast(value: str):
    # mapping สำหรับท่าทางเตียง
    bed_posture_map = {
        "ไม่อยู่ที่เตียง": 1,
        "นั่งบนเตียง": 2,
        "นอนหงาย": 3,
        "ตะแคงซ้าย": 4,
        "ตะแคงขวา": 5
    }

    # ถ้าเป็นตัวเลข ให้แปลงเป็น int
    if isinstance(value, str) and value.isdigit():
        return int(value)

    # ถ้าเป็น string ของท่าทาง ให้แปลงตาม mapping
    if value in bed_posture_map:
        return bed_posture_map[value]

    # คืนค่าเดิม
    return value


def convertCategoryNotification(value:int):
    if(value==2):
        return "SOS"
    if(value==3):
        return "Emergency"
    
thai_month_abbr = [
    "", "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
]

def format_thai_datetime(dt: datetime) -> str:
    day = dt.day
    month = thai_month_abbr[dt.month]
    year_be = dt.year + 543  # เปลี่ยนเป็น พ.ศ.
    time_str = dt.strftime("%H:%M")
    return f"{day} {month} {year_be} เวลา {time_str} น."

def send_warning_line_notification(current_log, maxObjCondition, warning_createdate,line_group_ids:list[str]):
    # แยก location ออกเป็นส่วน ๆ
    building_name = current_log.bed.room.floor.building.building_name
    floor_name = current_log.bed.room.floor.floor_name
    try:
        ward_name = current_log.bed.room.ward.ward_name or ''
    except AttributeError:
        ward_name = ''    
    room_name = current_log.bed.room.room_name
    location = building_name + " " + floor_name

    # แยกค่าที่ใช้ใน Flex message
    patient_name = current_log.patient.patient_name
    event_name = maxObjCondition.sensor_notifications_config_event
    bed_name = current_log.bed.bed_name + " " + room_name + " " + ward_name
    signal = smart_cast(maxObjCondition.sensor_notifications_config_signal)
    alert_time = format_thai_datetime(warning_createdate)

    # สร้างข้อความแจ้งเตือน
    warningMessage = create_flex_message(signal, patient_name, event_name, bed_name, location, alert_time)

    # ส่งข้อความแจ้งเตือนผ่านไลน์
    # group_id = "Ce2307cce0f0d4c4121ba0745e0e55523"  # ใส่ Group ID ที่จะส่งข้อความ

    for lg_id in line_group_ids:
        send_line_flex_message(lg_id,warningMessage)

    # send_line_flex_message(group_id,warningMessage)


def createWarningNotifications(db: Session, warning_data: NotificationCreateWarning):
    # get sensor and sensor notifications config datas
    sensor = db.query(Sensor).options(
        joinedload(Sensor.sensor_notifications_config),
        joinedload(Sensor.log_bed_patient_sensor)
            .joinedload(Log_Bed_Patient_Sensor.bed)
            .joinedload(Bed.room).joinedload(Room.ward),
        joinedload(Sensor.log_bed_patient_sensor)
            .joinedload(Log_Bed_Patient_Sensor.patient)
    ).filter(
        Sensor.sensor_id == warning_data.sensor_id,
        Sensor.deleted_at == None
    ).first()


    # find current sensor log
    current_log = sensor.log_bed_patient_sensor[-1]

    warning_sensor_data = smart_cast(warning_data.sensor_value)
    listSensorConditions = []

    # prepare condition same unit
    for notification_condition in sensor.sensor_notifications_config:
        if notification_condition.sensor_notifications_config_condition_unit == warning_data.sensor_unit:
            listSensorConditions.append(notification_condition)

    # check condition
    conditionsCompare = []
    for notification_condition in listSensorConditions:
        sign = notification_condition.sensor_notifications_config_condition_sign
        if op_map[sign](warning_sensor_data, notification_condition.sensor_notifications_config_condition_value):
            conditionsCompare.append(notification_condition)

    if conditionsCompare:
        # target condition checked
        maxObjCondition = max(conditionsCompare, key=lambda item: item.sensor_notifications_config_condition_value)
        if smart_cast(maxObjCondition.sensor_notifications_config_signal) != 1:
            print('create warning notifications')
            # create warning notification
            warningNotification = Notification()
            warningNotification.sensor_notifications_config_id = maxObjCondition.sensor_notifications_config_id
            warningNotification.log_bed_patient_sensor_id = current_log.log_bed_patient_sensor_id
            warningNotification.notification_category = convertCategoryNotification(smart_cast(maxObjCondition.sensor_notifications_config_signal))
            warningNotification.notification_accepted = 0
            warningNotification.notification_successed = 0
            warningNotification.notification_createdate = datetime.now()
            warningNotification.notification_updatedate = datetime.now()
            db.add(warningNotification)
            db.commit()
            db.refresh(warningNotification)

            # ส่งข้อความแจ้งเตือนผ่านไลน์
            send_warning_line_notification(current_log, maxObjCondition, warningNotification.notification_createdate)

            return warningNotification
        else:
            print('not create warning notification')
    else:
        print("can't create warning notification")

    return sensor

from datetime import datetime, timedelta

def check_and_create_warning(db: Session, sensor_id: int, sensor_value, sensor_unit: str, sensor_verify):
        
    sensor = db.query(Sensor).options(
    subqueryload(Sensor.log_bed_patient_sensor)
        .subqueryload(Log_Bed_Patient_Sensor.bed)
        .subqueryload(Bed.room)
        .subqueryload(Room.ward)
        .subqueryload(Ward.line_groups),
    subqueryload(Sensor.sensor_notifications_config),
    subqueryload(Sensor.log_bed_patient_sensor)
        .subqueryload(Log_Bed_Patient_Sensor.patient),

    with_loader_criteria(
        Line_Group,
        lambda lg: lg.deleted_at == None,
        include_aliases=True
    )
).filter(
    Sensor.sensor_id == sensor_id,
    Sensor.deleted_at == None
).first()
    
    line_empty_ward = db.query(Line_Group).filter(
    Line_Group.deleted_at == None,
    Line_Group.ward_id == None
).all()


    log = sensor.log_bed_patient_sensor[0]  # เอาอันแรก

    if not sensor or not sensor.log_bed_patient_sensor:
        # ไม่มี sensor/log → default level = 1
        setattr(sensor_verify, "notification_level", 1)
        return None

    current_log = sensor.log_bed_patient_sensor[-1]
    warning_sensor_data = smart_cast(sensor_value)

    #set line group ids
    line_group_ids =[]

    if not log.bed.room.ward or not log.bed.room.ward.line_groups:
        # print("not found")
        for lg in line_empty_ward:
            line_group_ids.append(lg.line_group_id)
        # line_dict ={
        # "lines":[
        #     {"line_group_id":lg.line_group_id,
        #      "line_group_name":lg.line_group_name}
        #      for lg in line_empty_ward
        # ]
        
        # }
        # print(line_dict)
        # print(len(line_empty_ward))
        
    else:
        for lg in log.bed.room.ward.line_groups:
            line_group_ids.append(lg.line_group_id)
        # print("found")
        # line_dict ={
        # "lines":[
        #     {"line_group_id":lg.line_group_id,
        #      "line_group_name":lg.line_group_name}
        #      for lg in log.bed.room.ward.line_groups
        # ]
        
        # }
        # print(line_dict)
        

    # print(bed_dict)
    
    # test_send(line_group_ids)
    

    # print(warning_sensor_data)

    if sensor.sensor_type == "bed_sensor":
        # ✅ กรณี bed_sensor ไม่ต้องเช็ค unit
        listSensorConditions = sensor.sensor_notifications_config
    else:
        listSensorConditions = [
            cond for cond in sensor.sensor_notifications_config
            if cond.sensor_notifications_config_condition_unit == sensor_unit
        ]


    now = datetime.now()
    
    # -----------------------
    # ประเมิน notification_level แยกออกจากการสร้าง notification
    # -----------------------
    matched_conditions = []
    for cond in listSensorConditions:
        
        sign = cond.sensor_notifications_config_condition_sign
        cond_value = cond.sensor_notifications_config_condition_value
        
        if op_map[sign](warning_sensor_data, cond_value):
            matched_conditions.append(cond)
            
    if matched_conditions:
        # กำหนด notification_level ตาม signal ของเงื่อนไขที่ตรงที่สุด
        maxObjCondition = max(matched_conditions, key=lambda item: item.sensor_notifications_config_condition_value)
        signal_value = smart_cast(maxObjCondition.sensor_notifications_config_signal)
        setattr(sensor_verify, "notification_level", int(signal_value))
        
    else:
        setattr(sensor_verify, "notification_level", 1)

    UpdateSensorVerify(sensor_verify)
    # print(sensor_verify.__dict__)
    # -----------------------
    # ส่วนสร้าง notification ตามเดิม
    # -----------------------
    valid_conditions = []

    for cond in listSensorConditions:
        sign = cond.sensor_notifications_config_condition_sign
        cond_value = cond.sensor_notifications_config_condition_value

        if op_map[sign](warning_sensor_data, cond_value):
            last_notification = (
                db.query(Notification)
                .filter(Notification.sensor_notifications_config_id == cond.sensor_notifications_config_id)
                .order_by(Notification.notification_createdate.desc())
                .first()
            )

            repeat_minutes = cond.sensor_notifications_config_repeatnoti or 0
            rangetime_minutes = cond.sensor_notifications_config_rangetime or 0

            if last_notification:
                elapsed = now - last_notification.notification_createdate

                if last_notification.sensor_notifications_config_id == cond.sensor_notifications_config_id:
                    if elapsed < timedelta(minutes=repeat_minutes):
                        continue
                else:
                    if elapsed < timedelta(minutes=rangetime_minutes):
                        continue
            else:
                if rangetime_minutes > 0:
                    elapsed = now - current_log.log_bed_patient_sensor_date
                    if elapsed<timedelta(minutes=rangetime_minutes):
                        continue

            valid_conditions.append(cond)

    if valid_conditions:
        maxObjCondition = max(valid_conditions, key=lambda item: item.sensor_notifications_config_condition_value)
        signal_value = smart_cast(maxObjCondition.sensor_notifications_config_signal)

        if signal_value != 1:
            warningNotification = Notification()
            warningNotification.sensor_notifications_config_id = maxObjCondition.sensor_notifications_config_id
            warningNotification.log_bed_patient_sensor_id = current_log.log_bed_patient_sensor_id
            warningNotification.notification_category = convertCategoryNotification(signal_value)
            warningNotification.notification_accepted = 0
            warningNotification.notification_successed = 0
            warningNotification.notification_createdate = now
            warningNotification.notification_updatedate = now
            db.add(warningNotification)
            db.commit()
            db.refresh(warningNotification)

            send_warning_line_notification(current_log, maxObjCondition, warningNotification.notification_createdate,line_group_ids)
            return warningNotification

    return None



def test_send(line_group_ids:list[str]):
    for i in line_group_ids:
        print('x',i)
