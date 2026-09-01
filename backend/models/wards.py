from sqlalchemy import Column, DateTime, Integer, String, Date
from models.base import Base
from sqlalchemy.orm import relationship


class Ward(Base):
    __tablename__ = "wards"

    ward_id = Column(Integer, primary_key=True, index=True, nullable=False)
    ward_name = Column(String(255), nullable=False)
    deleted_at = Column(DateTime, nullable=True, index=True)

    room = relationship("Room", back_populates="ward", uselist=True)

    user = relationship("User", back_populates="ward", uselist=True)

    line_groups = relationship("Line_Group", back_populates="ward")