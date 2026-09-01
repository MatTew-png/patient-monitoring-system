import sqlite3
import random
import time
from datetime import datetime

def insert_mock_data(db_path, sensor_ids, value_ranges, num_records=10, interval=5):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    for i in range(1, num_records + 1):  # วนลูปเพิ่มข้อมูล num_records รอบ
        selected_sensors = random.choices(sensor_ids, k=len(sensor_ids))  # เลือก sensor_id N ตัวแบบสุ่ม (อาจมีซ้ำ)

        mock_data = []
        for sensor_id in selected_sensors:
            # กำหนดช่วงค่าตัวเลขสุ่มของ sensor_id
            min_val, max_val = value_ranges.get(sensor_id, (10, 100))
            value = round(random.uniform(min_val, max_val), 2)

            # สร้าง timestamp เป็นเวลาปัจจุบัน
            timestamp = datetime.now()

            # เพิ่มเข้า list
            mock_data.append((sensor_id, value, timestamp))

        # แทรกข้อมูลทั้งหมดของรอบนี้ลงฐานข้อมูล
        cursor.executemany(
            "INSERT INTO history_value_sensor (sensor_id, history_value_sensor_value, history_value_sensor_time) VALUES (?, ?, ?);",
            mock_data
        )
        conn.commit()

        print(f"Inserted {len(selected_sensors)} records: {mock_data}")

        # หน่วงเวลา 5 วินาที ก่อนเพิ่มข้อมูลรอบถัดไป
        time.sleep(interval)

    conn.close()

# กำหนด sensor_id และช่วงค่าที่ต้องการ
sensor_ids = [27, 28, 29, 31, 32, 33, 35, 36, 38, 39, 40, 42, 44, 1407, 1408, 1409, 1410, 1411, 1413, 1414, 1416, 1417, 1426, 1427, 1428, 1430, 1434, 1435]  # เซ็นเซอร์ที่สามารถเลือกได้
value_ranges = {
    27: (60, 100),
    28: (95, 100),
    29: (12, 20),
    31: (12, 20),
    32: (95, 100),
    33: (60, 100),
    35: (60, 100),
    36: (12, 20),
    38: (60, 100),
    39: (12, 20),
    40: (95, 100),
    42: (12, 20),
    44: (12, 20),
    1407: (12, 20),
    1408: (60, 100),
    1409: (60, 100),
    1410: (60, 100),
    1411: (60, 100),
    1413: (95, 100),
    1414: (60, 100),
    1416: (60, 100),
    1417: (12, 20),
    1426: (12, 20),
    1427: (95, 100),
    1428: (60, 100),
    1430: (95, 100),
    1434: (95, 100),
    1435: (60, 100)
}

# ใช้งานฟังก์ชัน (เพิ่มข้อมูลทุก 5 วินาที โดยเลือก sensor_id จำนวน N ตัว)
insert_mock_data(r"E:\Project Bed Sensor\ProjectWeb\backend\test.db", sensor_ids, value_ranges, num_records=10, interval=5)
