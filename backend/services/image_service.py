import os, uuid, shutil
from fastapi import UploadFile
from typing import Optional

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "..", "uploads")

def save_image(file: UploadFile, sub_dir: Optional[str] = None) -> str:
    ext = os.path.splitext(file.filename)[-1]
    filename = f"{uuid.uuid4()}{ext}"
    
    if sub_dir:
        path = os.path.join(UPLOAD_DIR, sub_dir)
        os.makedirs(path, exist_ok=True)
    else:
        path = UPLOAD_DIR

    file_path = os.path.join(path, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Return path relative to server
    relative_path = f"/uploads/{sub_dir}/{filename}" if sub_dir else f"/uploads/{filename}"
    return relative_path
