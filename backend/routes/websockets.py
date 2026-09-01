# routes/websockets.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from models.base import SessionLocal, get_db
import crud.sensors as crud_sensors
import crud.notifications as crud_notifications # Import crud notifications
from app.websocket_manager import manager # Import manager
import json
import asyncio # Import asyncio if adding delays

# --- Sensor Router (ถ้าแยกไว้) ---
router_sensors = APIRouter(prefix="/ws/sensors", tags=["WebSockets - Sensors"])

@router_sensors.websocket("/{sensor_id}")
async def websocket_sensor_endpoint(
    websocket: WebSocket,
    sensor_id: int,
    db: Session = Depends(get_db)
):
    topic = f"sensor_{sensor_id}"
    await manager.connect(websocket, topic)
    print(f"[Sensor Connect] Client connected to {topic}")

    previous_payload = None

    try:
        while True:
            try:
                with SessionLocal() as db:
                    sensor = crud_sensors.get_value_sensor(sensor_id=sensor_id, db=db)
            except Exception as e:
                await websocket.send_text(json.dumps({"error": str(e)}))
                await asyncio.sleep(1)
                continue

            if sensor and sensor.history_value_sensor:
                history = sensor.history_value_sensor[0]

                payload = {
                    "bed_id": sensor.bed_id,
                    "sensor_type": sensor.sensor_type,
                    "sensor_status": sensor.sensor_status,
                    "sensor_mac_i": sensor.sensor_mac_i,
                    "sensor_mac_ii": sensor.sensor_mac_ii,
                    "sensor_unit": sensor.sensor_unit,
                    "sensor_name": sensor.sensor_name,
                    "sensor_id": sensor.sensor_id,
                    "history_value_sensor": [
                        {
                            "sensor_id": history.sensor_id,
                            "history_value_sensor_value": history.history_value_sensor_value,
                            "history_value_sensor_time": history.history_value_sensor_time.isoformat(),
                            "history_value_sensor_id": history.history_value_sensor_id,
                        }
                    ]
                }

                payload_str = json.dumps(payload)

                if payload_str != previous_payload:
                    await websocket.send_text(payload_str)
                    previous_payload = payload_str
                    print(f"[Sensor Update] Sent latest value to {topic}")

            else:
                await websocket.send_text(json.dumps({"warning": "No history data"}))

            await asyncio.sleep(1)

    except WebSocketDisconnect:
        manager.disconnect(websocket, topic)
        print(f"[Sensor Disconnect] Client disconnected from {topic}")

    except Exception as e:
        manager.disconnect(websocket, topic)
        print(f"[Sensor Error] {e!r}")


# --- Router สำหรับ Notifications ---
router = APIRouter(
    prefix="/ws/notifications",
    tags=["WebSockets - Notifications"],
    responses={404: {"description": "Not found"}},
)

# --- แก้ไข Helper function ---
async def handle_websocket_connection(
    websocket: WebSocket,
    topic: str,
    db: Session = Depends(get_db)
    ):
    await manager.connect(websocket, topic)
    print(f"[Connect] Client connected to {topic}. Attempting to send initial state (record by record)...")

    initial_state_data = []
    try:
        # --- ส่วนของการเรียก CRUD functions (เหมือนเดิม) ---
        if topic == "notifications_sos_pending":
            initial_state_data = crud_notifications.get_current_sos_pending(db)
        elif topic == "notifications_emergency_pending":
            initial_state_data = crud_notifications.get_current_emergency_pending(db)
        elif topic == "notifications_sos_accepted":
            initial_state_data = crud_notifications.get_current_sos_accepted(db)
        elif topic == "notifications_emergency_accepted":
            initial_state_data = crud_notifications.get_current_emergency_accepted(db)
        elif topic == "notifications_all":
            initial_state_data = crud_notifications.get_current_notifications(db)
        # --- ไม่ส่ง initial state สำหรับ _completed topics ---

        valid_initial_state = [item for item in initial_state_data if item is not None]
        print(f"[Initial State] Found {len(valid_initial_state)} valid items for {topic}.")

        # --- *** แก้ไขตรงนี้: วน Loop ส่งทีละรายการ *** ---
        if valid_initial_state:
            print(f"[Initial State] Sending items individually for {topic}...")
            initial_send_count = 0
            for item_index, item_data in enumerate(valid_initial_state):
                try:
                    # ส่งข้อมูลของ notification แต่ละตัวไปตรงๆ
                    # Client ต้องปรับการรับข้อมูลให้รับทีละ object แทนที่จะรับ array ก้อนใหญ่
                    payload_str = json.dumps(item_data, default=manager._datetime_serializer)
                    await websocket.send_text(payload_str)
                    initial_send_count += 1
                    # Optional: ใส่ delay เล็กน้อยถ้าส่งเยอะมากๆ อาจจะช่วยลดภาระทันทีทันใด
                    # if (item_index + 1) % 20 == 0: # เช่น ทุกๆ 20 รายการ
                    #     await asyncio.sleep(0.05)
                except Exception as send_err:
                    # ถ้าส่งรายการใดรายการหนึ่งไม่สำเร็จ ให้หยุดส่งรายการที่เหลือ
                    # และ log error ไว้
                    print(f"!!!!!!!! ERROR sending initial state item {item_index} for {topic}: {send_err !r}")
                    break # หยุดการส่ง initial state ที่เหลือ
            print(f"[Initial State] Finished sending {initial_send_count}/{len(valid_initial_state)} items individually for {topic}.")
        else:
            print(f"[Initial State] No valid initial state to send for {topic}.")
        # --- *** จบส่วนแก้ไข *** ---

    except Exception as e:
        print(f"!!!!!!!! ERROR querying or preparing initial state for {topic}: {e !r}")

    # --- ส่วน Loop รับข้อมูลจาก Client (เหมือนเดิม) ---
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, topic)
        print(f"[Disconnect] Client explicitly disconnected for topic {topic}")
    except Exception as e:
        print(f"[WS Error] WS error for topic {topic}: {e !r}")
        manager.disconnect(websocket, topic)


# --- Endpoint definitions (เหมือนเดิม แต่จะเรียกใช้ handle_websocket_connection ที่แก้ไขแล้ว) ---
@router.websocket("/sos/pending")
async def ws_notifications_sos_pending(websocket: WebSocket, db: Session = Depends(get_db)):
    await handle_websocket_connection(websocket, "notifications_sos_pending", db=db)

@router.websocket("/emergency/pending")
async def ws_notifications_emergency_pending(websocket: WebSocket, db: Session = Depends(get_db)):
    await handle_websocket_connection(websocket, "notifications_emergency_pending", db=db)

@router.websocket("/sos/accepted")
async def ws_notifications_sos_accepted(websocket: WebSocket, db: Session = Depends(get_db)):
    await handle_websocket_connection(websocket, "notifications_sos_accepted", db=db)

@router.websocket("/emergency/accepted")
async def ws_notifications_emergency_accepted(websocket: WebSocket, db: Session = Depends(get_db)):
    await handle_websocket_connection(websocket, "notifications_emergency_accepted", db=db)

# Completed endpoints ไม่ส่ง initial state อยู่แล้ว
@router.websocket("/sos/completed")
async def ws_notifications_sos_completed(websocket: WebSocket, db: Session = Depends(get_db)): # อาจจะไม่ต้องใช้ db ที่นี่
    await handle_websocket_connection(websocket, "notifications_sos_completed", db=db)

@router.websocket("/emergency/completed")
async def ws_notifications_emergency_completed(websocket: WebSocket, db: Session = Depends(get_db)): # อาจจะไม่ต้องใช้ db ที่นี่
    await handle_websocket_connection(websocket, "notifications_emergency_completed", db=db)

@router.websocket("/all")
async def ws_notifications_all(websocket: WebSocket, db: Session = Depends(get_db)):
    await handle_websocket_connection(websocket, "notifications_all", db=db)