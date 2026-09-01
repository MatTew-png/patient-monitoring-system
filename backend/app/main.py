import os
import shutil
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.security import OAuth2PasswordBearer
from models.base import get_db
from models.users import User
from routes import beds,line_group,wards,buildings,floors,history_value_sensor, log_bed_patient_sensor,medical_history,medical_information,notifications, patients,personal_behavior,rooms,sensor_notifications_config,sensors,users
from fastapi import Depends, FastAPI, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from routes import websockets as ws_routes # <<< Import เข้ามาที่นี่
from contextlib import asynccontextmanager
import asyncio
from app.background_poller import poll_database_for_updates, poll_notifications_for_updates
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from app.auth import authenticate_user, create_access_token, get_current_user
from routes.gadgetbridge_ingest import router as router_gb_hr
# โหลด environment variables จากไฟล์ .env
load_dotenv()

sensor_poller_task = None
notification_poller_task = None
poller_task = None # ตัวแปร global เก็บ task
@asynccontextmanager
async def lifespan(app: FastAPI):
    global sensor_poller_task, notification_poller_task
    print("Application startup: Starting background pollers...")
    # เริ่ม Sensor Poller
    sensor_poller_task = asyncio.create_task(poll_database_for_updates(interval_seconds=2))
    # เริ่ม Notification Poller
    notification_poller_task = asyncio.create_task(poll_notifications_for_updates(interval_seconds=3)) # << อาจจะตั้ง interval ต่างกันได้
    yield
    # Shutdown logic
    print("Application shutdown: Stopping background pollers...")
    # ยกเลิก Sensor Poller
    if sensor_poller_task:
        print("Cancelling sensor poller task...")
        sensor_poller_task.cancel()
        try:
            await sensor_poller_task
        except asyncio.CancelledError:
            print("Sensor poller task successfully cancelled.")
    # ยกเลิก Notification Poller
    if notification_poller_task:
        print("Cancelling notification poller task...")
        notification_poller_task.cancel()
        try:
            await notification_poller_task
        except asyncio.CancelledError:
            print("Notification poller task successfully cancelled.")

app = FastAPI(lifespan=lifespan) # <<< ต้องมี lifespan=lifespan ตรงนี้

# Path ไปยังโฟลเดอร์ที่เก็บภาพ
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_PATH  = os.path.join(BASE_DIR, "..", "uploads")

# ✅ สร้างโฟลเดอร์ uploads ถ้ายังไม่มี
os.makedirs(UPLOAD_PATH, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=UPLOAD_PATH), name="uploads")

# Include API routes
app.include_router(router_gb_hr) 
app.include_router(ws_routes.router) # <<< และใช้งานที่นี่
app.include_router(ws_routes.router_sensors) #
app.include_router(beds.router)
app.include_router(line_group.router)
app.include_router(buildings.router)
app.include_router(floors.router)
app.include_router(history_value_sensor.router)
app.include_router(medical_history.router)
app.include_router(medical_information.router)
app.include_router(notifications.router)
app.include_router(patients.router)
app.include_router(personal_behavior.router)
app.include_router(rooms.router)
app.include_router(sensor_notifications_config.router)
app.include_router(sensors.router)
app.include_router(users.router)
app.include_router(log_bed_patient_sensor.router)
app.include_router(wards.router)


origins = [
   "http://localhost:5173","https://core-encrypt.l2s-xinghai.org","http://dekdee3.informatics.buu.ac.th:8040","http://localhost:8040"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows only the specified origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

class HRIn(BaseModel):
    mac: str
    uuid: str
    payload_hex: str | None = None
    hr: int | None = None
    spo2: int | None = None
    class Config:
        json_schema_extra = {"example":{
            "mac":"8C:CE:FD:F0:EB:4C","uuid":"xiaomi-realtime",
            "payload_hex":"00000201...","hr":92,"spo2":None
        }}

class HROut(BaseModel):
    ok: bool
    reason: str | None = None
    received_bytes: int | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int


@app.post("/webhook/gadgetbridge/hr", response_model=HROut,
          status_code=status.HTTP_200_OK)
async def webhook_hr(data: HRIn):
    nbytes = (len(data.payload_hex)//2) if data.payload_hex else 0
    return HROut(ok=True, received_bytes=nbytes)

@app.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": user.user_username, "user_id": user.user_id}
    )

    return {"access_token": access_token, "token_type": "bearer", "user_id": user.user_id}


@app.get("/current-user")
def read_users_me(current_user: User = Depends(get_current_user)):
    return {"name": current_user.user_name, "position": current_user.user_position, "ward_id": current_user.ward_id}
