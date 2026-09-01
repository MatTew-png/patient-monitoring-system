from sqlalchemy import Column, Integer, String, Date, DateTime
from models.base import Base
from sqlalchemy.orm import relationship

class Building(Base):
    __tablename__ = "buildings"

    building_id = Column(Integer, primary_key=True, index=True, nullable=False)
    building_name = Column(String(255), nullable=False)
    deleted_at = Column(DateTime, nullable=True, index=True)

    floor = relationship("Floor", back_populates="building",lazy="selectin")

    