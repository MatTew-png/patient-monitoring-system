from sqlalchemy import Column, ForeignKey, Integer, String, Date, DateTime
from models.base import Base
from sqlalchemy.orm import relationship

class Floor(Base):
    __tablename__ = "floors"

    floor_id = Column(Integer, primary_key=True, index=True, nullable=False)
    building_id = Column(Integer, ForeignKey("buildings.building_id", ondelete="CASCADE"), nullable=False)
    floor_name = Column(String(255), nullable=False)
    deleted_at = Column(DateTime, nullable=True, index=True)


    building = relationship("Building", back_populates="floor",lazy="selectin")

    room = relationship("Room", back_populates="floor",lazy="selectin")
