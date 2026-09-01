from sqlalchemy import ARRAY, Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.dialects.mysql import JSON
from models.base import Base
from sqlalchemy.orm import relationship

class Bed(Base):
    __tablename__ = "beds"

    bed_id = Column(Integer, primary_key=True, index=True, nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.room_id", ondelete="CASCADE"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patient.patient_id", ondelete="SET NULL"), nullable=True)
    bed_name = Column(String(255), nullable=True)
    bed_activated = Column(Boolean, nullable=True)
    selectedShowSensorId = Column(ARRAY(String), nullable=True)
    # selectedShowSensorId = Column(JSON, nullable=True) # ใช้ JSON ถ้าใช้ MySQL
    deleted_at = Column(DateTime, nullable=True, index=True)
    # สร้างความสัมพันธ์กับตาราง room
    room = relationship("Room", back_populates="bed")

    # สร้างความสัมพันธ์กับตาราง patient
    patient = relationship("Patient", back_populates="bed")

    sensors = relationship("Sensor", back_populates="bed", lazy="joined", uselist=True)

    log_bed_patient_sensor = relationship("Log_Bed_Patient_Sensor", back_populates="bed")
