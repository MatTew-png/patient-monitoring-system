# models/base.py
# # - For SQLite -
# from sqlalchemy import create_engine
# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.orm import sessionmaker

# # สร้างคลาส Base สำหรับ SQLAlchemy
# Base = declarative_base()

# # สร้างการเชื่อมต่อกับฐานข้อมูล
# DATABASE_URL = "sqlite:///./test.db"

# #x
# # สร้าง engine สำหรับเชื่อมต่อกับฐานข้อมูล
# engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# # สร้าง session สำหรับทำงานกับฐานข้อมูล
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# # # ฟังก์ชันสำหรับสร้างตารางในฐานข้อมูล
# def init_db():
#     # สร้างตารางทั้งหมดจาก Base
#     Base.metadata.create_all(bind=engine)

# # Dependency สำหรับสร้าง Session กับฐานข้อมูลในแต่ละคำร้องขอ
# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()


# Docker Deploy
# - For MySQL -
import os
import time
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import OperationalError
from dotenv import load_dotenv

load_dotenv()
Base = declarative_base()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    # "mysql+pymysql://core:encrypt@mysql:3306/core_encrypt?charset=utf8mb4",
    "mysql+pymysql://core:encrypt@localhost:8060/core_encrypt"
)

# เพิ่ม connection pool configuration
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,   # ป้องกัน connection ค้าง
    pool_recycle=3600,    # recycle connection ทุก 1 ชั่วโมง
    pool_size=10,         # จำนวน connection ใน pool
    max_overflow=20,      # connection เพิ่มได้สูงสุด
    echo=False,           # True ถ้าอยากเห็น SQL
    future=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def wait_for_db(max_retries=30, delay=2):
    """รอให้ database พร้อมใช้งาน"""
    for attempt in range(max_retries):
        try:
            # ทดสอบการเชื่อมต่อ
            with engine.connect() as conn:
                conn.execute("SELECT 1")
            print("✅ Database connection successful!")
            return True
        except OperationalError as e:
            print(f"⏳ Waiting for database... (attempt {attempt + 1}/{max_retries})")
            print(f"Error: {e}")
            time.sleep(delay)
    
    print("❌ Failed to connect to database after maximum retries")
    return False

def init_db():
    """รอ database แล้วสร้าง tables"""
    if wait_for_db():
        try:
            Base.metadata.create_all(bind=engine)
            print("✅ Database tables created successfully!")
        except Exception as e:
            print(f"❌ Error creating tables: {e}")
            raise
    else:
        raise Exception("Cannot connect to database")

def get_db():
    """Dependency สำหรับ FastAPI"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_connection():
    """ทดสอบการเชื่อมต่อ database"""
    try:
        with engine.connect() as conn:
            result = conn.execute("SELECT VERSION()")
            version = result.scalar()
            print(f"✅ MySQL version: {version}")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

