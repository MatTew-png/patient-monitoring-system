from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException,Request,WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session, noload
from models import sensors as models
from schemas import sensors as schemas
from models.base import SessionLocal
from models.base import engine, Base, get_db
import crud.sensors as crud
import crud.history_value_sensor as crudHistoryValue
import crud.notifications as crudNotification
import json
from fastapi.encoders import jsonable_encoder
import asyncio


router = APIRouter(
    prefix="/sensors",
    tags=["sensors"],
    responses={404: {"description": "Not found"}},
)

# Dependency: Get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Get all sensors
@router.get("/")
def get_sensors(db: Session = Depends(get_db)):
    return crud.get_sensors(db)

# Get sensor by ID
@router.get("/{sensor_id}", response_model=schemas.SensorResponse)
def get_sensor_route(sensor_id: int, db: Session = Depends(get_db)): # ควรเปลี่ยนชื่อฟังก์ชันไม่ให้ซ้ำกับ crud
    print(f"DEBUG: Route get_sensor_route called for sensor_id: {sensor_id}") # เพิ่ม log
    sensor_data = crud.get_sensor(sensor_id=sensor_id, db=db) # เรียกใช้ CRUD function
    if sensor_data is None:
        raise HTTPException(status_code=404, detail="Sensor not found or has been deleted")
    return sensor_data

# Create new sensor
@router.post("/", response_model=schemas.SensorResponse)
def create_sensor(sensor: schemas.SensorCreate, db: Session = Depends(get_db)):
    new_sensor = models.Sensor(**sensor.model_dump())  
    db.add(new_sensor)
    db.commit()
    db.refresh(new_sensor)
    return new_sensor

# Update sensor
@router.put("/{sensor_id}", response_model=schemas.SensorResponse)
def update_sensor(sensor_id: int, sensor: schemas.SensorCreate, db: Session = Depends(get_db)):
    return crud.update_sensor(sensor_id, sensor, db)

# Delete sensor
@router.delete("/{sensor_id}")
def delete_sensor(sensor_id: int, db: Session = Depends(get_db)):
    return crud.delete_sensor(sensor_id, db)

@router.get("/sensorFree/all", response_model=list[schemas.SensorResponse])
def get_all_sensor_free(db: Session = Depends(get_db)):
    return crud.get_all_sensors_free(db)

# Get sensor with history values
@router.get("/getValueSensor/{sensor_id}", response_model=schemas.SensorResponse)
def get_value_sensor(sensor_id: int, db: Session = Depends(get_db)):
    return crud.get_value_sensor(sensor_id, db)


@router.patch("/edit/{sensor_id}", response_model=schemas.SensorResponse)
def update_sensor(sensor_id: int, sensor: schemas.SensorCreate, db: Session = Depends(get_db)):
    return crud.update_sensor(sensor_id, sensor, db)

@router.put("/{sensor_id}/remove-from-bed/{bed_id}",response_model=schemas.SensorResponse)
def remove_sensor_from_bed(sensor_id:int,bed_id:int,db:Session=Depends(get_db)):
    return crud.remove_sensor_from_bed(sensor_id,bed_id,db)

@router.patch("/update-sensor-notifications-config/{sensor_id}",response_model=schemas.SensorWithConfigResponse)
def patchSensorNotificationConfig(sensor_id:int,sensor:schemas.SensorWithConfigResponse,db:Session=Depends(get_db)):
    return crud.patchSensorNotificationConfig(sensor_id,sensor,db)

@router.get("/sensorWithoutHistory/all", response_model=list[schemas.SensorResponse])
def get_sensors(db: Session = Depends(get_db)):
    print("DEBUG: Route get_sensors_no_history_in_route called (querying directly in route)")
    sensors_data = db.query(models.Sensor).options( # <<< Query โดยตรง
        noload(models.Sensor.history_value_sensor),
    ).filter(
        models.Sensor.deleted_at == None
    ).all()
    return sensors_data

@router.post("/restapi/sensors_value")
async def getSensorAllValueOneTime(request: Request, db: Session = Depends(get_db)):
    body = await request.json()
    return crud.getSensorAllValueOneTime(db,body)
    
@router.websocket("/ws/sensors_value")
async def websocket_sensor_value(websocket: WebSocket):
    await websocket.accept()

    try:
        # รับ sensors_id ครั้งเดียว
        text_data = await websocket.receive_text()
        json_data = json.loads(text_data)

        # loop ส่งข้อมูล
        while True:
            db = SessionLocal()
            try:
                response_data = crud.getSensorAllValueOneTime(db, json_data)
                
                # ส่งข้อมูล JSON แบบปลอดภัย
                try:
                    await websocket.send_json(jsonable_encoder(response_data))
                except WebSocketDisconnect:
                    print("Client disconnected during send_json")
                    break

            except Exception as e:
                # ส่งข้อความ error แบบปลอดภัย
                try:
                    await websocket.send_text(f"Error during data fetch: {str(e)}")
                except WebSocketDisconnect:
                    print("Client disconnected while sending error message")
                break
            finally:
                db.close()

            await asyncio.sleep(1)

    except WebSocketDisconnect:
        print("Client disconnected")


@router.websocket("/ws/sensor-input-value")
async def sensor_websocket(websocket: WebSocket, db: Session = Depends(get_db)):
    await websocket.accept()
    print("WebSocket Connected.")
    try:
        while True:
            data = await websocket.receive_text()
            sensor_data = json.loads(data)

            # หา sensor id จาก mac id
            # ดึงค่ามาจาก dict
            sensor_mac_i = sensor_data.get("sensor_mac_i")
            sensor_mac_ii = sensor_data.get("sensor_mac_ii")

            sensor_id = None  # default

            if sensor_mac_i and sensor_mac_ii:
                # ถ้ามีทั้งคู่ → ใช้ฟังก์ชันสอง
                sensor_id = crud.get_sensor_by_mac_i_and_ii(sensor_mac_i, sensor_mac_ii, db)
            elif sensor_mac_i:
                # ถ้ามีแค่ mac_i → ใช้ฟังก์ชันแรก
                sensor_id = crud.get_sensor_by_mac_i(sensor_mac_i, db)



            value = sensor_data["value"]
            # สมมติ unit มาใน json หรือกำหนด default ได้
            unit = sensor_data.get("unit", None)
            timestamp = datetime.now()

            # insert ข้อมูล sensor value
            record_value_sensor = crudHistoryValue.insert_sensor_value(db, sensor_id, value, timestamp)
            
            # print(f"Inserted sensor: {sensor_id}, value: {value}, timestamp: {timestamp.isoformat()}")
            # print(record_value_sensor.__dict__)
            # crud.update_history(record_value_sensor)

            # เช็คเงื่อนไข warning และสร้าง notification (ถ้ามี)
            warning_notification = crudNotification.check_and_create_warning(db, sensor_id, value, unit,record_value_sensor)
            

            # if warning_notification:
                # print(f"Created warning notification id: {warning_notification.notification_id}")
            # else:
                # print("No warning notification created.")

    except WebSocketDisconnect:
        print("WebSocket Disconnected.")

@router.websocket("/ws/pseudo-sensor-input-value")
async def sensor_websocket(websocket: WebSocket, db: Session = Depends(get_db)):
    await websocket.accept()
    print("WebSocket Connected.")
    try:
        while True:
            data = await websocket.receive_text()
            sensor_data = json.loads(data)
            sensor_id=sensor_data["sensor_id"]



            value = sensor_data["value"]
            # สมมติ unit มาใน json หรือกำหนด default ได้
            unit = sensor_data.get("unit", None)
            timestamp = datetime.now()

            record_value_sensor = crudHistoryValue.insert_sensor_value(db, sensor_id, value, timestamp)
            
            warning_notification = crudNotification.check_and_create_warning(db, sensor_id, value, unit,record_value_sensor)
            


    except WebSocketDisconnect:
        print("WebSocket Disconnected.")
