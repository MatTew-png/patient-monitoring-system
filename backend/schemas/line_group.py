# schemas.py (Pydantic v2)
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class LineGroupBase(BaseModel):
    ward_id: Optional[int] = Field(None)
    line_group_name: Optional[str] = Field(None, max_length=255)
    deleted_at: Optional[datetime] = None

class LineGroupCreate(LineGroupBase):
    pass

class LineGroupUpdate(BaseModel):
    ward_id: Optional[int] = None
    line_group_name: Optional[str] = None
    deleted_at: Optional[datetime] = None

class LineGroup(LineGroupBase):
    model_config = ConfigDict(from_attributes=True)
    line_group_id: str
