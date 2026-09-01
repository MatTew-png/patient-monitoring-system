# routes/gadgetbridge_ingest.py
import json
from urllib.parse import parse_qs
from datetime import datetime, timezone
from fastapi import APIRouter, Request, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from models.base import SessionLocal
from models.history_value_sensor import History_Value_Sensor
from models.sensors import Sensor 
from app.websocket_manager import manager

router = APIRouter(prefix="/webhook/gadgetbridge", tags=["Gadgetbridge"])

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

def _norm_mac(s:str) -> str:
    return s.strip().upper().replace('-',':')


@router.post("/hr")
async def ingest_hr(request: Request, db: Session = Depends(get_db)):
    raw = await request.body()
    if not raw:
        raise HTTPException(400, "empty body")
    ctype = (request.headers.get("content-type") or "").lower()

    # พยายามอ่าน JSON ก่อน แล้ว fallback เป็น form/querystring
    data = None
    if "json" in ctype:
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            # บางไคลเอนต์ส่ง single-quote หรือ text/plain ที่เป็น JSON
            try:
                data = json.loads(raw.decode().replace("'", '"'))
            except Exception:
                pass
    if data is None:
        # รองรับ application/x-www-form-urlencoded
        try:
            data = {k: v[0] for k, v in parse_qs(raw.decode()).items()}
        except Exception:
            raise HTTPException(400, f"unsupported body, ctype={ctype}")

    mac_in = data.get("mac") or data.get("MAC")
    hr_in  = data.get("hr") or data.get("heart_rate")
    if not mac_in or hr_in is None:
        raise HTTPException(400, "mac/hr missing")

    mac = _norm_mac(str(mac_in))
    try:
        hr = int(hr_in)
    except Exception:
        raise HTTPException(400, "invalid hr")

    norm_db_mac = func.replace(func.upper(Sensor.sensor_mac_i), '-', ':')
    sensor = db.query(Sensor).filter(norm_db_mac == mac).first()
    if not sensor:
        raise HTTPException(404, "sensor not found")

    rec = History_Value_Sensor(
        sensor_id=sensor.sensor_id,
        history_value_sensor_value=hr,
        history_value_sensor_time=datetime.now(timezone.utc)
    )
    db.add(rec); db.commit()

    await manager.broadcast_json(
        {"sensor_id": sensor.sensor_id, "mac": mac, "hr": hr, "t": datetime.now(timezone.utc)},
        topic=f"sensor_{sensor.sensor_id}"
    )
    return {"ok": True, "sensor_id": sensor.sensor_id, "hr": hr}
