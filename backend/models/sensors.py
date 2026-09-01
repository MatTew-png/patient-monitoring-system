from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Date, DateTime
from models.base import Base
from sqlalchemy.orm import relationship
from datetime import datetime # 

class Sensor(Base):
    __tablename__ = "sensors"

    sensor_id = Column(Integer, primary_key=True, index=True, nullable=False)
    bed_id = Column(Integer, ForeignKey("beds.bed_id", ondelete="SET NULL"))
    sensor_type = Column(String(50), nullable=False)
    sensor_status = Column(Boolean)
    sensor_mac_i = Column(String(50), nullable=False, unique=True)
    sensor_mac_ii = Column(String(50), unique=True)
    sensor_unit = Column(String(50))
    sensor_name = Column(String(255))
    deleted_at = Column(DateTime, nullable=True, index=True)

    bed = relationship("Bed", back_populates="sensors")

    history_value_sensor = relationship("History_Value_Sensor",
                                        primaryjoin="Sensor.sensor_id == History_Value_Sensor.sensor_id",
                                        order_by="desc(History_Value_Sensor.history_value_sensor_time)",
                                        back_populates="sensor", uselist=True, lazy="noload")

    sensor_notifications_config = relationship("Sensor_Notifications_Config", back_populates="sensor",uselist=True)

    log_bed_patient_sensor = relationship("Log_Bed_Patient_Sensor", back_populates="sensor")