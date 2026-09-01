# simulate_ws_client.py
import asyncio
import websockets
import random
import json
from datetime import datetime, timedelta

def random_heart_rate():
    return random.randint(101, 140)
    # chance = random.random()
    # if chance < 0.1:
    #     return random.randint(40, 59)
    # elif chance < 0.2:
    #     return random.randint(101, 140)
    # else:
    #     return random.randint(60, 100)

def random_respiration():
    # return random.randint(21, 30)
    chance = random.random()
    if chance < 0.1:
        return random.randint(21, 30)
    else:
        return random.randint(12, 20)

def random_spo2():
    chance = random.random()
    if chance < 0.03:
        return random.randint(85, 89)
    elif chance < 0.1:
        return random.randint(90, 94)
    else:
        return random.randint(95, 99)

async def simulate_sensor_data(uri, heart_rate_sensors, spo2_sensors, respiration_sensors, bed_sensors, interval=1, bed_interval=300):
    next_bed_time = datetime.now()

    async with websockets.connect(uri) as websocket:
        while True:
            now = datetime.now()
            all_data = []

            if now >= next_bed_time:
                # bed_positions = ["นอนหงาย", "นั่งบนเตียง", "ไม่อยู่ที่เตียง", "ตะแคงซ้าย", "ตะแคงขวา"]
                bed_positions = ["ไม่อยู่ที่เตียง"]
                for sensor_id in bed_sensors:
                    value = random.choice(bed_positions)
                    all_data.append((sensor_id, value, "bed"))
                next_bed_time = now + timedelta(seconds=bed_interval)

            for sensor_id in heart_rate_sensors:
                all_data.append((sensor_id, random_heart_rate(), "bpm"))

            for sensor_id in spo2_sensors:
                all_data.append((sensor_id, random_spo2(), "%"))

            for sensor_id in respiration_sensors:
                all_data.append((sensor_id, random_respiration(), "rpm"))

            for sensor_id, value, unit in all_data:
                payload = {
                    "sensor_id": sensor_id,
                    "value": str(value),
                    "unit": unit
                }
                await websocket.send(json.dumps(payload))

            print(f"[{now.strftime('%Y-%m-%d %H:%M:%S')}] Sent {len(all_data)} records")
            await asyncio.sleep(interval)


# Sensor IDs
bed_sensors=[1]
# bed_sensors = [1, 4, 8, 12, 15, 18, 21, 25, 29, 32, 36, 40, 43, 46, 50, 53, 59, 63, 64, 65, 67, 68, 72, 74, 75]
heart_rate_sensors = [10,14]
# heart_rate_sensors = [3, 6, 10, 13, 19, 23, 27, 33, 39, 42, 45, 47, 52, 55, 57, 62]
spo2_sensors=[]
# spo2_sensors = [7, 9, 14, 17, 22, 28, 31, 34, 38, 41, 48, 58, 61, 69, 70, 71, 73]
respiration_sensors=[123]
# respiration_sensors = [2, 5, 11, 16, 20, 24, 26, 30, 35, 37, 44, 49, 51, 54, 56, 60, 66, 76, 77, 78]

# Run simulation
if __name__ == "__main__":
    uri = "ws://core-encrypt-api.l2s-xinghai.org/sensors/ws/pseudo-sensor-input-value"
    asyncio.run(simulate_sensor_data(
        uri,
        heart_rate_sensors,
        spo2_sensors,
        respiration_sensors,
        bed_sensors,
        interval=1,
        bed_interval=1
    ))

#