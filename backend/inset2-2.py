import sqlite3
import random
import time
from datetime import datetime, timedelta

def random_heart_rate():
    chance = random.random()
    if chance < 0.1:
        return random.randint(40, 59)   # ช้า
    elif chance < 0.2:
        return random.randint(101, 140) # เร็ว
    else:
        return random.randint(60, 100)  # ปกติ

def random_respiration():
    chance = random.random()
    if chance < 0.1:
        return random.randint(21, 30)  # ผิดปกติ
    else:
        return random.randint(12, 20)  # ปกติ

def random_spo2():
    chance = random.random()
    if chance < 0.03:
        return random.randint(85, 89)  # ผิดปกติมาก
    elif chance < 0.1:
        return random.randint(90, 94)  # ผิดปกตินิดหน่อย
    else:
        return random.randint(95, 99)  # ปกติ

def insert_mock_data(db_path, heart_rate_sensors, spo2_sensors, respiration_sensors, bed_sensors, interval=1, bed_interval=300):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    next_bed_time = datetime.now()

    try:
        while True:
            mock_data = []
            now = datetime.now()

            if now >= next_bed_time:
                bed_positions = ["นอนหงาย", "นั่งบนเตียง", "ไม่อยู่ที่เตียง", "ตะแคงซ้าย", "ตะแคงขวา"]
                for sensor_id in bed_sensors:
                    value = random.choice(bed_positions)
                    mock_data.append((sensor_id, value, now))
                next_bed_time = now + timedelta(seconds=bed_interval)

            for sensor_id in heart_rate_sensors:
                value = random_heart_rate()
                mock_data.append((sensor_id, value, now))

            for sensor_id in spo2_sensors:
                value = random_spo2()
                mock_data.append((sensor_id, value, now))

            for sensor_id in respiration_sensors:
                value = random_respiration()
                mock_data.append((sensor_id, value, now))

            cursor.executemany(
                "INSERT INTO history_value_sensor (sensor_id, history_value_sensor_value, history_value_sensor_time) VALUES (?, ?, ?);",
                mock_data
            )
            conn.commit()

            print(f"[{now.strftime('%Y-%m-%d %H:%M:%S')}] Inserted {len(mock_data)} records")

            time.sleep(interval)

    except KeyboardInterrupt:
        print("Data insertion stopped manually.")
    finally:
        conn.close()

# Sensor IDs
bed_sensors = [1, 4, 8, 12, 15, 18, 21, 25, 29, 32, 36, 40, 43, 46, 50, 53, 59, 63, 64, 65, 67, 68, 72, 74, 75]
heart_rate_sensors = [3, 6, 10, 13, 19, 23, 27, 33, 39, 42, 45, 47, 52, 55, 57, 62]
spo2_sensors = [7, 9, 14, 17, 22, 28, 31, 34, 38, 41, 48, 58, 61, 69, 70, 71, 73]
respiration_sensors = [2, 5, 11, 16, 20, 24, 26, 30, 35, 37, 44, 49, 51, 54, 56, 60, 66, 76, 77, 78]

# Run
insert_mock_data(
    db_path="test.db",
    heart_rate_sensors=heart_rate_sensors,
    spo2_sensors=spo2_sensors,
    respiration_sensors=respiration_sensors,
    bed_sensors=bed_sensors,
    interval=1,
    bed_interval=300
)
