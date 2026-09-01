@echo off
echo Creating FastAPI Project...

:: 1. สร้าง Virtual Environment
python -m venv venv
call venv\Scripts\activate

:: 2. ติดตั้งไลบรารี
pip install fastapi uvicorn sqlalchemy alembic python-dotenv
pip freeze > requirements.txt

:: 3. สร้างโฟลเดอร์
mkdir alembic
mkdir app

:: 4. สร้างไฟล์ .env
echo DATABASE_URL=sqlite:///./app.db > .env
echo SECRET_KEY=mysecretkey >> .env

:: 5. สร้าง README.md
echo # FastAPI + SQLite Backend > README.md
echo. >> README.md
echo ## วิธีใช้งาน >> README.md
echo ```bash >> README.md
echo uvicorn main:app --reload >> README.md
echo ``` >> README.md

:: 6. Initialize Alembic
alembic init alembic

echo ✅ โครงสร้าง FastAPI พร้อมใช้งาน!
pause
