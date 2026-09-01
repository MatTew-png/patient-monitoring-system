# models/line_group.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from models.base import Base

class Line_Group(Base):
    __tablename__ = "line_group"


    line_group_id = Column(String(255), primary_key=True, index=True, nullable=False)
    ward_id = Column(Integer, ForeignKey("wards.ward_id"), nullable=True)
    line_group_name = Column(String(255), nullable=True)
    deleted_at = Column(DateTime, nullable=True)


    ward = relationship("Ward", back_populates="line_groups")
