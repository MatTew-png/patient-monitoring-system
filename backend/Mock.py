from sqlalchemy import create_engine, Column, Integer, String, Boolean, ForeignKey, Date, Float, DateTime, Time
from sqlalchemy.orm import sessionmaker, declarative_base
# from faker import Faker
import random
from datetime import datetime, timedelta
from sqlalchemy import event
from sqlalchemy.sql import text

# ตั้งค่า Database
DATABASE_URL = "sqlite:///test.db"  # เปลี่ยนเป็น MySQL หรือ PostgreSQL ได้
engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()
# fake = Faker("th_TH")

# 🏢 Buildings
class Building(Base):
    __tablename__ = "buildings"
    building_id = Column(Integer, primary_key=True, autoincrement=True)
    building_name = Column(String, nullable=False)

# 🏬 Floors
class Floor(Base):
    __tablename__ = "floors"
    floor_id = Column(Integer, primary_key=True, autoincrement=True)
    building_id = Column(Integer, ForeignKey("buildings.building_id", ondelete="CASCADE"), nullable=False)
    floor_name = Column(String, nullable=False)

# 🚪 Rooms
class Room(Base):
    __tablename__ = "rooms"
    room_id = Column(Integer, primary_key=True, autoincrement=True)
    floor_id = Column(Integer, ForeignKey("floors.floor_id", ondelete="CASCADE"), nullable=False)
    room_name = Column(String, nullable=False)

# 🏥 Patients
class Patient(Base):
    __tablename__ = "patient"
    patient_id = Column(Integer, primary_key=True, autoincrement=True)
    patient_name = Column(String(255), nullable=False)
    patient_age = Column(Integer, nullable=False)
    patient_gender = Column(String(10), nullable=False)
    patient_dob = Column(Date, nullable=False)
    patient_disease = Column(String(255))
    patient_status = Column(String(50), nullable=False)
    patient_date_in = Column(Date, nullable=False)
    patient_bloodtype = Column(String(5), nullable=True)

# 🛏️ Beds
class Bed(Base):
    __tablename__ = "beds"
    bed_id = Column(Integer, primary_key=True, autoincrement=True)
    room_id = Column(Integer, ForeignKey("rooms.room_id", ondelete="CASCADE"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patient.patient_id", ondelete="SET NULL"))
    bed_name = Column(String(255), nullable=False)
    bed_activated = Column(Boolean, default=True)
    selected_show_sensor_id = Column(String(50))  # ✅ ฟิลด์ใหม่


# ✅ Sensors
class Sensor(Base):
    __tablename__ = "sensors"
    sensor_id = Column(Integer, primary_key=True, autoincrement=True)
    bed_id = Column(Integer, ForeignKey("beds.bed_id", ondelete="CASCADE"))  # 🔹 Many-to-One
    sensor_type = Column(String(50), nullable=False)
    sensor_status = Column(Boolean, default=True)
    sensor_mac_i = Column(String(50), unique=True, nullable=False)
    sensor_mac_ii = Column(String(50), unique=True, nullable=True)
    sensor_unit = Column(String(50))  
    sensor_name = Column(String(50), nullable=True)


# 📊 Medical Information
class MedicalInformation(Base):
    __tablename__ = "medical_information"
    medical_info_id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patient.patient_id"), nullable=False)
    medical_info_record_date = Column(Date, nullable=False)
    medical_info_blood_pressure = Column(String(20), nullable=True)
    medical_info_pulse = Column(Integer, nullable=True)
    medical_info_respiration_rate = Column(Integer, nullable=True)
    medical_info_weight = Column(Float, nullable=True)
    medical_info_height = Column(Float, nullable=True)

# 📜 Medical History
class MedicalHistory(Base):
    __tablename__ = "medical_history"
    med_history_id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patient.patient_id"), nullable=False)
    medical_history_inspect_date = Column(Date, nullable=False)
    medical_history_doctor = Column(String(255), nullable=False)
    medical_history_disease = Column(String(255))
    medical_history_type = Column(String(100), nullable=False)
    medical_history_medicine = Column(String(255), nullable=True)
    medical_history_drug_allergy = Column(String(255), nullable=True)
    medical_history_treatment_result = Column(String(255), nullable=True)

# ✅ Users
class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, autoincrement=True)
    user_name = Column(String, nullable=False)
    user_position = Column(String, nullable=False)
    user_username = Column(String, nullable=False, unique=True)
    user_password = Column(String, nullable=False)

# ✅ Sensor Notifications Config
class SensorNotificationsConfig(Base):
    __tablename__ = "sensor_notifications_config"
    sensor_notifications_config_id = Column(Integer, primary_key=True, autoincrement=True)
    sensor_id = Column(Integer, ForeignKey("sensors.sensor_id", ondelete="CASCADE"), nullable=False)
    sensor_notifications_config_event = Column(String(255), nullable=False)
    sensor_notifications_config_usage = Column(Boolean, default=True)
    sensor_notifications_config_repeatnoti = Column(Integer, nullable=True)
    sensor_notifications_config_rangetime = Column(Integer, nullable=True)
    sensor_notifications_config_signal = Column(String(50), nullable=True)

# ✅ Notifications
class Notification(Base):
    __tablename__ = "notifications"
    notification_id = Column(Integer, primary_key=True, autoincrement=True)
    sensor_notifications_config_id = Column(Integer, ForeignKey("sensor_notifications_config.sensor_notifications_config_id", ondelete="CASCADE"), nullable=False)
    notification_name = Column(String(255), nullable=False)
    notification_successed = Column(Boolean, default=False)
    notification_category = Column(String(100), nullable=True)
    notification_accepted = Column(String(100), default=False)
    notification_createdate = Column(DateTime, default=datetime.utcnow)
    notification_updatedate = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# ✅ Personal Behavior
class PersonalBehavior(Base):
    __tablename__ = "personal_behavior"
    personal_behavior_id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patient.patient_id"), nullable=False)
    personal_behavior_date = Column(Date, nullable=False)
    personal_behavior_wake_time = Column(Time, nullable=True)
    personal_behavior_duration = Column(Float, nullable=True)
    personal_behavior_position = Column(String(50), nullable=True)
    personal_behavior_sleep_interruption_count = Column(Integer, nullable=True)
    personal_behavior_fall_asleep_time = Column(Time, nullable=True)
    personal_behavior_noise_disruption_count = Column(Integer, nullable=True)
    personal_behavior_out_of_bed_duration = Column(Float, nullable=True)

class HistoryValueSensor(Base):
    __tablename__ = "history_value_sensor"
    history_value_sensor_id = Column(Integer, primary_key=True, autoincrement=True)
    sensor_id = Column(Integer, ForeignKey("sensors.sensor_id", ondelete="CASCADE"), nullable=False)  # 🔹 Many-to-One
    history_value_sensor_value = Column(String, nullable=False)  # 🔹 ค่าที่บันทึกไว้จากเซ็นเซอร์
    history_value_sensor_time = Column(DateTime, default=datetime.utcnow, nullable=False)  # 🔹 เวลาที่บันทึกค่า

class LogBedPatientSensor(Base):
    __tablename__ = "log_bed_patient_sensor"
    log_bed_patient_sensor_id = Column(Integer, primary_key=True, autoincrement=True)
    bed_id = Column(Integer, ForeignKey("beds.bed_id", ondelete="CASCADE"))
    patient_id = Column(Integer, ForeignKey("patient.patient_id", ondelete="CASCADE"))
    sensor_id = Column(Integer, ForeignKey("sensors.sensor_id", ondelete="CASCADE"))
    log_bed_patient_sensor_date = Column(DateTime, default=datetime.utcnow)

# 🏥 สร้างตารางทั้งหมด
Base.metadata.create_all(bind=engine)

room_types = [
    "ห้องฉุกเฉิน", "ห้องพิเศษ", "ห้องพักผู้ป่วยพิเศษ", "ห้องพักฟื้น", "ห้องผ่าตัด"
]


# 📌 ฟังก์ชันสร้าง Mock Data
def create_mock_data():
    db = SessionLocal()

    buildings = [
        Building(building_name="ตึกภายใน"),
        Building(building_name="ตึกภายนอก")
    ]

    db.add_all(buildings)
    db.commit()

    # Define floors
    floors = [Floor(building_id=random.choice(buildings).building_id, floor_name=f"ชั้น {i+1}") for i in range(10)]
    db.add_all(floors)
    db.commit()

    # ✅ Room types mapping with fixed number of rooms
    room_types_mapping = {
        1: {"type": "ห้องฉุกเฉิน", "count": 1},  # ชั้น 1 มีแค่ 1 ห้องฉุกเฉิน
        2: {"type": "ห้องผ่าตัด", "count": 3},  # ห้องผ่าตัดมี 3 ห้อง
        3: {"type": "ห้องพักผู้ป่วยพิเศษ", "count": 5},  # ห้องพักผู้ป่วยพิเศษมี 5 ห้อง
        4: {"type": "ห้องพักฟื้น", "count": 3}  # ห้องพักฟื้นมี 3 ห้อง
    }

    # ✅ Create rooms based on mapping
    rooms = []
    for floor in floors:
        floor_number = int(floor.floor_name.split()[1])  # Extract floor number

        if floor_number in room_types_mapping:
            room_data = room_types_mapping[floor_number]
            room_type = room_data["type"]
            num_rooms = room_data["count"]
        else:
            room_type = "ห้องพิเศษ"  # ชั้น 5-10 เป็นห้องพิเศษ
            num_rooms = 5  # ตั้งค่าเริ่มต้นให้มี 5 ห้องต่อชั้นสำหรับห้องพิเศษ

        for i in range(num_rooms):
            room_name = f"{room_type} {floor_number}0{i+1}"  # ตั้งชื่อห้องตามรูปแบบ
            rooms.append(Room(floor_id=floor.floor_id, room_name=room_name))

    # ✅ Insert rooms into database
    db.add_all(rooms)
    db.commit()

    # รายชื่อโรคประจำตัวที่ใช้สุ่ม
    diseases = [
        "เบาหวาน", "ความดันโลหิตสูง", "โรคหัวใจ", "โรคไต", "มะเร็ง", "ไขมันในเลือดสูง",
        "โรคปอด", "หอบหืด", "เก๊าท์", "โรคกระเพาะ", "ไมเกรน", None, None, None # None คือไม่มีโรค
    ]

    # ✅ คำนวณอายุจากวันเกิด
    def calculate_age(dob):
        today = datetime.today().date()
        return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))

    # Patients
    patients = []
    for _ in range(7):
        dob = fake.date_of_birth(minimum_age=20, maximum_age=80)  # กำหนดวันเกิด
        age = calculate_age(dob)  # คำนวณอายุจากวันเกิด

        patient = Patient(
            patient_name=fake.name(),
            patient_age=age,  # ใช้ค่าที่คำนวณได้
            patient_gender=random.choice(["ชาย", "หญิง"]),
            patient_dob=dob,
            patient_disease=random.choice(diseases),
            patient_status=random.choice(["คงที่", "วิกฤติ", "ฟื้นตัว"]),
            patient_date_in=fake.date_between(start_date="-1y", end_date=datetime.today().date()),  
            patient_bloodtype=random.choice(["A", "B", "AB", "O"])
        )
        patients.append(patient)

    db.add_all(patients)
    db.commit()

    # ✅ ดึงรายชื่อ Patients ทั้งหมดจากฐานข้อมูล
    patients = db.query(Patient).all()
    patient_ids = [p.patient_id for p in patients]  # สร้างรายการ patient_id

    # ✅ กำหนดจำนวนเตียงต่อประเภทห้อง
    beds_per_room_type = {
        "ห้องฉุกเฉิน": 10,
        "ห้องผ่าตัด": 1,
        "ห้องพักผู้ป่วยพิเศษ": 1,
        "ห้องพักฟื้น": 5,
        "ห้องพิเศษ": 20  # กรณีเป็นห้องพิเศษที่ไม่ตรงกับประเภทด้านบน
    }

    # ✅ สร้างเตียง และสุ่มกำหนด patient_id ให้บางเตียง
    beds = []
    for room in rooms:
        # ดึงประเภทห้องจากชื่อห้อง
        room_type = next((key for key in beds_per_room_type if key in room.room_name), "ห้องพิเศษ")
        num_beds = beds_per_room_type.get(room_type, 1)  # Default 20 เตียงถ้าไม่ตรงกับประเภทใดเลย

        for i in range(num_beds):  # สร้างเตียงตามจำนวนที่กำหนด
            bed_name = f"เตียง {i+1}"
            bed_activated = random.choice([True, False])  # สุ่มว่าเตียงพร้อมใช้งานหรือไม่
            patient_id = random.choice(patient_ids) if random.random() < 0.7 else None  # ✅ กำหนด patient_id 70% ของเตียง

            beds.append(Bed(room_id=room.room_id, patient_id=patient_id, bed_name=bed_name, bed_activated=bed_activated))

    # ✅ บันทึกลงฐานข้อมูล
    db.add_all(beds)
    db.commit()

    #🔹 Sensors
    # ประเภทเซ็นเซอร์ที่รองรับ
    sensor_types = ["bed_sensor", "heart_rate", "spo2", "respiration"]
    sensors = []

    # ฟังก์ชันกำหนดค่า sensor_unit อัตโนมัติ
    def get_sensor_unit(sensor_type):
        return {
            "spo2": "%",
            "respiration": "rpm",
            "heart_rate": "bpm",
            "bed_sensor": None  # Null สำหรับ bed sensor
        }.get(sensor_type, None)

    # ฟังก์ชันกำหนด sensor_name อัตโนมัติ
    def get_sensor_name(sensor_type):
        return {
            "spo2": "SpO2 Sensor",
            "respiration": "Respiration",
            "heart_rate": "Heart Rate",
            "bed_sensor": "Bed Sensor"
        }.get(sensor_type, "Unknown Sensor")

    # เพิ่มเซ็นเซอร์ให้แต่ละเตียง
    for bed in beds:
        assigned_sensors = set()  # เก็บเซ็นเซอร์ที่ถูกเพิ่มไปแล้วในเตียงนั้น ๆ

        # เพิ่ม "bed_sensor" ให้ทุกเตียง (บังคับต้องมี)
        bed_sensor = Sensor(
            bed_id=bed.bed_id,
            sensor_type="bed_sensor",
            sensor_status=random.choice([True, False]),
            sensor_mac_i=fake.mac_address(),
            sensor_mac_ii=fake.mac_address(),
            sensor_unit=get_sensor_unit(None),
            sensor_name=get_sensor_name("Bed Sensor")
        )
        sensors.append(bed_sensor)
        assigned_sensors.add("bed_sensor")

        # สุ่มเพิ่มเซ็นเซอร์อื่น ๆ (แต่ต้องไม่ซ้ำกัน)
        num_extra_sensors = random.randint(2, 3)  # เพิ่มเซ็นเซอร์อื่นๆ อีก 2-3 ตัว
        extra_sensors = random.sample(sensor_types[1:], num_extra_sensors)  # เลือกจาก ["heart_rate", "spo2", "respiration"]

        for sensor_type in extra_sensors:
            sensor = Sensor(
                bed_id=bed.bed_id,
                sensor_type=sensor_type,
                sensor_status=random.choice([True, False]),
                sensor_mac_i=fake.mac_address(),
                sensor_mac_ii=fake.mac_address(),
                sensor_unit=get_sensor_unit(sensor_type),
                sensor_name=get_sensor_name(sensor_type)
            )
            sensors.append(sensor)
            assigned_sensors.add(sensor_type)

    # เพิ่มเซ็นเซอร์ทั้งหมดลงใน database
    db.add_all(sensors)
    db.commit()

    # 🔹 Medical Information (Ensure every patient has at least one record)
    medical_info = []

    for patient in patients:
        num_records = random.randint(1, 5)  # แต่ละคนมี 1-5 รายการ
        for _ in range(num_records):
            record = MedicalInformation(
                patient_id=patient.patient_id,
                medical_info_record_date=fake.date_between(start_date="-10y", end_date="today"),  # ไม่เกินวันนี้
                medical_info_blood_pressure=f"{random.randint(90, 140)}/{random.randint(60, 90)}",
                medical_info_pulse=random.randint(60, 100),
                medical_info_respiration_rate=random.randint(12, 20),
                medical_info_weight=round(random.uniform(50, 100)),  # ปัดเศษน้ำหนักให้ดูสมจริง
                medical_info_height=round(random.uniform(150, 200))  # ปัดเศษส่วนสูงให้ดูสมจริง
            )
            medical_info.append(record)

    db.add_all(medical_info)
    db.commit()


    # # รายชื่อโรค/ปัญหาสุขภาพที่ใช้สุ่ม
    diseases = [
        "เบาหวาน", "ความดันโลหิตสูง", "โรคหัวใจ", "โรคไต", "มะเร็ง", "ไขมันในเลือดสูง",
        "โรคปอด", "หอบหืด", "เก๊าท์", "โรคกระเพาะ", "ไมเกรน", None, None, None # None คือไม่มีโรค
    ]

    # ประเภทการรักษา
    treatment_types = ["ให้ยา", "ผ่าตัด", "กายภาพบำบัด", "ตรวจติดตาม", "ฉีดยา"]

    # รายชื่อยาที่ใช้ (ยาตัวอย่าง)
    medicines = ["Metformin", "Aspirin", "Paracetamol", "Ibuprofen", "Losartan", "Insulin"]

    # การแพ้ยา/อาหาร
    drug_allergies = ["ไม่มี", "แพ้เพนิซิลลิน", "แพ้อาหารทะเล", "แพ้แอสไพริน", "แพ้ยาซัลฟา"]

    # สถานะผลลัพธ์การรักษา
    treatment_results = [
        "อาการควบคุมได้ดี", "ต้องติดตามอาการต่อเนื่อง", "ยังมีอาการกำเริบ", "หายขาดแล้ว", "อาการทรงตัว"
    ]

    # 🔹 Create Medical History (Ensure every patient has at least one record)
    medical_histories = []

    for patient in patients:
        num_records = random.randint(1, 5)  # แต่ละคนมี 1-5 รายการ
        for _ in range(num_records):
            history = MedicalHistory(
                patient_id=patient.patient_id,
                medical_history_inspect_date=fake.date_between(start_date="-10y", end_date="today"),  # วันที่ไม่เกินปัจจุบัน
                medical_history_doctor=fake.name(),
                medical_history_disease=random.choice(diseases),  # สุ่มโรค
                medical_history_type=random.choice(treatment_types),  # สุ่มประเภทการรักษา
                medical_history_medicine=random.choice(medicines),  # สุ่มยาที่ใช้
                medical_history_drug_allergy=random.choice(drug_allergies),  # สุ่มอาการแพ้ยา
                medical_history_treatment_result=random.choice(treatment_results)  # สุ่มผลลัพธ์การรักษา
            )
            medical_histories.append(history)

    db.add_all(medical_histories)
    db.commit()


    # กำหนดค่ารหัสผ่านเดียวกันสำหรับทุก User
    hashed_password = "$2b$12$mPrhBJvh1.cP6rMuesItmulJGjXpUefbanLb761W./SOTce6dsYAm"

    # สร้าง Users
    users = [
        User(
            user_name=fake.name(),
            user_position=random.choice(["Doctor", "Nurse", "Admin"]),
            user_username=f"Test{i+1}",  # ตั้งชื่อ username เป็น Test1, Test2, ...
            user_password=hashed_password  # ใช้รหัสผ่านเดียวกัน
        )
        for i in range(10)
    ]

    # บันทึกข้อมูลลงฐานข้อมูล
    db.add_all(users)
    db.commit()

    # 🔹 Sensor Notification Configuration
    sensor_events = {
        "bed_sensor": ["ไม่อยู่ที่เตียง", "นั่ง", "นอนตะแคงซ้าย", "นอนตะแคงขวา"], 
        "heart_rate": [
            "หัวใจเต้นเร็ว (>150 bpm)", 
            "หัวใจเต้นเร็ว (>120 bpm)", 
            "หัวใจเต้นช้า (<50 bpm)", 
            "HRV 30-50 ms", 
            "HRV <30 ms"
        ],
        "spo2": [
            "ออกซิเจนในเลือดต่ำ (< 90%)", 
            "ออกซิเจนในเลือดต่ำมาก (< 95%)", 
            "ออกซิเจนในเลือดสูง (> 99%)"
        ],
        "respiration": [
            "อัตราการหายใจ (< 25 RP)", 
            "อัตราการหายใจ (> 8 RP)"
        ]
    }

    # สร้างการแจ้งเตือนให้ทุกเซ็นเซอร์อย่างน้อย 1 รายการ
    sensor_notifications = []

    for sensor in sensors:
        events = sensor_events.get(sensor.sensor_type, ["Unknown Event"])  # ดึง event ตาม sensor_type
        selected_event = random.choice(events)  # เลือกเหตุการณ์แบบสุ่มจากประเภทเซ็นเซอร์

        notification = SensorNotificationsConfig(
            sensor_id=sensor.sensor_id,
            sensor_notifications_config_event=selected_event,
            sensor_notifications_config_usage=True,  # กำหนดให้ใช้งานแจ้งเตือน
            sensor_notifications_config_repeatnoti=random.randint(1, 5),  # สุ่มจำนวนการแจ้งเตือนซ้ำ
            sensor_notifications_config_rangetime=random.randint(1, 30),  # สุ่มช่วงเวลาแจ้งเตือน
            sensor_notifications_config_signal=random.choice(["วิกฤติ", "อันตราย", "เฝ้าระวัง"])  # สุ่มระดับสัญญาณ
        )

        sensor_notifications.append(notification)

    db.add_all(sensor_notifications)
    db.commit()

    # 🔹 Notifications
    notifications = [
        Notification(
            sensor_notifications_config_id=random.choice(sensor_notifications).sensor_notifications_config_id,
            notification_name=fake.sentence(),
            notification_successed=random.choice([True, False]),
            notification_category=random.choice(["วิกฤติ", "อันตราย", "เฝ้าระวัง"]),
            notification_accepted=random.choice(["Nurse", "Docter","Nurse","Nurse","Nurse","Nurse","Nurse","Nurse","Nurse","Nurse"]),
            notification_createdate=fake.date_time_this_year(),
            notification_updatedate=fake.date_time_this_year()
        ) for _ in range(10)
    ]
    db.add_all(notifications)
    db.commit()

    # # 🔹 Personal Behavior
    # personal_behaviors = [
    #     PersonalBehavior(
    #         patient_id=random.randint(1, 30),  # ต้องตรวจสอบให้สัมพันธ์กับ Patient จริง ๆ
    #         personal_behavior_date=fake.date_this_year(),
    #         personal_behavior_wake_time=fake.time_object(),
    #         personal_behavior_duration=random.uniform(4.0, 10.0),
    #         personal_behavior_position=random.choice(["Side", "Back", "Stomach"]),
    #         personal_behavior_sleep_interruption_count=random.randint(0, 5),
    #         personal_behavior_fall_asleep_time=fake.time_object(),
    #         personal_behavior_noise_disruption_count=random.randint(0, 3),
    #         personal_behavior_out_of_bed_duration=random.uniform(0.5, 2.0)
    #     ) for _ in range(10)
    # ]
    # db.add_all(personal_behaviors)
    # db.commit()

    # 🔹 กำหนดค่าปกติ และ ค่าผิดปกติสำหรับแต่ละประเภทเซ็นเซอร์
    normal_values = {
        "bed_sensor": ["นอนหงาย", "ตะแคงซ้าย", "ตะแคงขวา"],  # ค่าปกติ
        "heart_rate": list(range(60, 100)),  # อัตราหัวใจปกติ
        "spo2": list(range(95, 100)),  # ค่า SpO2 ปกติ
        "respiration": list(range(12, 20))  # อัตราการหายใจปกติ
    }

    abnormal_values = {
        "bed_sensor": ["ไม่อยู่บนเตียง", "นั่งบนเตียง"],  # ค่าผิดปกติ
        "heart_rate": [random.randint(40, 55), random.randint(120, 160)],  # หัวใจเต้นผิดปกติ
        "spo2": [random.randint(85, 94), random.randint(100, 102)],  # ค่า SpO2 ต่ำ หรือ สูงผิดปกติ
        "respiration": [random.randint(5, 11), random.randint(21, 30)]  # อัตราการหายใจผิดปกติ
    }

    # 🔹 คำนวณช่วงเวลา 3 วัน ทุกๆ 5 วินาที
    start_time = datetime.now() - timedelta(days=3)
    time_interval = timedelta(seconds=5)

    history_values = []
    batch_size = 100000
    start_time = datetime.utcnow() - timedelta(days=3)
    time_interval = timedelta(seconds=5)
    all_sensors = {
        sensor.sensor_id: sensor for sensor in db.query(Sensor).filter(Sensor.bed_id.isnot(None)).all()
    }
    
    while start_time <= datetime.utcnow():
        for sensor in all_sensors.values():
            sensor_type = sensor.sensor_type

            # 90% ใช้ค่าปกติ, 10% ใช้ค่าผิดปกติ
            sensor_value = random.choice(normal_values.get(sensor_type, [50])) if random.random() < 0.9 else random.choice(abnormal_values.get(sensor_type, [150]))

            # ✅ แก้ปัญหา Encoding & ใช้ datetime ตรงๆ
            history_values.append(
                HistoryValueSensor(
                    sensor_id=sensor.sensor_id,
                    history_value_sensor_value=str(sensor_value).encode('utf-8').decode('utf-8'),  # ✅ Fix Encoding
                    history_value_sensor_time=start_time  # ✅ ใช้ datetime ตรงๆ
                )
            )

            if len(history_values) >= batch_size:
                db.add_all(history_values)
                db.commit()
                history_values.clear()

        start_time += time_interval

    # ✅ Commit ข้อมูลที่เหลือ
    if history_values:
        db.add_all(history_values)
        db.commit()




    db.close()
    print("Mock data inserted successfully!")

# 📌 รันสร้าง Mock Data
if __name__ == "__main__":
    create_mock_data()
