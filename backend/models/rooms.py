from sqlalchemy import Column, ForeignKey, Integer, String, Date, DateTime
from models.base import Base
from sqlalchemy.orm import relationship

class Room(Base):
    __tablename__ = "rooms"

    room_id = Column(Integer, primary_key=True, index=True, nullable=False)
    ward_id = Column(Integer, ForeignKey("wards.ward_id", ondelete="SET NULL"), nullable=True)
    floor_id = Column(Integer, ForeignKey("floors.floor_id", ondelete="CASCADE"))
    room_name = Column(String(255), nullable=False)
    deleted_at = Column(DateTime, nullable=True, index=True)

    floor = relationship("Floor", back_populates="room",lazy="selectin")

    bed = relationship("Bed", back_populates="room")

    ward = relationship("Ward", back_populates="room",lazy="joined")
    