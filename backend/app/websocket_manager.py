# app/websocket_manager.py
# (Imports เหมือนเดิม)
import json
from typing import List, Dict, Any
from fastapi import WebSocket
from datetime import datetime

class ConnectionManager:
    def __init__(self):
        # เปลี่ยน key เป็น topic string (เช่น "sensor_29", "notifications")
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # แยกการเก็บ ID ล่าสุดสำหรับ sensor และ notification
        self.last_broadcasted_sensor_id: Dict[str, int] = {}
        self.last_broadcasted_notification_id: int = 0 # Notification ID ล่าสุดที่ส่งไป (ทั่วโลก)

    async def connect(self, websocket: WebSocket, topic: str):
        """เชื่อมต่อ WebSocket กับ topic ที่ระบุ"""
        await websocket.accept()
        if topic not in self.active_connections:
            self.active_connections[topic] = []
        self.active_connections[topic].append(websocket)
        print(f"WebSocket connected for topic: {topic}. Total clients for topic: {len(self.active_connections[topic])}")

    def disconnect(self, websocket: WebSocket, topic: str):
        """ตัดการเชื่อมต่อ WebSocket จาก topic ที่ระบุ"""
        if topic in self.active_connections:
            try:
                self.active_connections[topic].remove(websocket)
                print(f"WebSocket disconnected for topic: {topic}. Remaining clients: {len(self.active_connections[topic])}")
                if not self.active_connections[topic]:
                    del self.active_connections[topic]
                    print(f"Removed topic {topic} from active connections.")
                    # อาจจะลบ last_id ของ sensor ถ้า topic เป็น sensor และไม่มีใครฟังแล้ว (optional)
            except ValueError:
                pass # กรณี client หายไปก่อนจะ remove
        else:
            print(f"Topic {topic} not found in active connections during disconnect.")

    # --- Sensor ID Tracking ---
    def update_last_sensor_id(self, sensor_id_str: str, last_id: int):
         self.last_broadcasted_sensor_id[sensor_id_str] = last_id

    def get_last_sensor_id(self, sensor_id_str: str) -> int:
        return self.last_broadcasted_sensor_id.get(sensor_id_str, 0)

    # --- Notification ID Tracking ---
    def update_last_notification_id(self, last_id: int):
        """อัปเดต Global Notification ID ล่าสุดที่ส่งไป"""
        self.last_broadcasted_notification_id = last_id

    def get_last_notification_id(self) -> int:
        """ดึง Global Notification ID ล่าสุดที่ส่งไป"""
        return self.last_broadcasted_notification_id

    async def broadcast_json(self, data: Any, topic: str):
        """ส่งข้อมูล JSON ไปยัง Clients ทั้งหมดที่เชื่อมต่อกับ topic ที่ระบุ"""
        if topic in self.active_connections:
            disconnected_clients = []
            # ใช้ default=_datetime_serializer เพื่อแปลง datetime object
            json_message = json.dumps(data, default=self._datetime_serializer)
            for connection in self.active_connections[topic]:
                try:
                    await connection.send_text(json_message)
                except Exception as e:
                    print(f"Failed to send message to a client for topic {topic}: {e}. Marking for removal.")
                    disconnected_clients.append(connection)

            for client in disconnected_clients:
                 # ส่ง topic ไปด้วยตอน disconnect
                 self.disconnect(client, topic)

    def _datetime_serializer(self, obj):
        """Helper function สำหรับแปลง datetime เป็น ISO format สำหรับ JSON"""
        if isinstance(obj, datetime):
            return obj.isoformat()
        # อาจจะเพิ่มการจัดการ object ประเภทอื่นๆ ตามต้องการ
        try:
             # ลองแปลงเป็น dict ถ้าเป็น Pydantic model
             if hasattr(obj, 'model_dump'):
                 return obj.model_dump(mode='json')
        except Exception:
             pass
        # ถ้าแปลงไม่ได้ ให้ raise TypeError
        raise TypeError(f"Object of type {obj.__class__.__name__} is not JSON serializable")


# สร้าง instance ของ Manager เพื่อใช้งานทั่วทั้งโปรเจกต์
manager = ConnectionManager()