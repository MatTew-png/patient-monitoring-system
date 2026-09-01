from sqlalchemy import Column, Integer, ForeignKey, DateTime
from models.base import Base
from sqlalchemy.orm import relationship

class Log_Bed_Patient_Sensor(Base):
    __tablename__ = "log_bed_patient_sensor"

    log_bed_patient_sensor_id = Column(Integer, primary_key=True, index=True, nullable=False)
    bed_id = Column(Integer, ForeignKey("beds.bed_id", ondelete="CASCADE"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patient.patient_id", ondelete="CASCADE"), nullable=False)
    sensor_id = Column(Integer, ForeignKey("sensors.sensor_id", ondelete="CASCADE"), nullable=False)
    log_bed_patient_sensor_date = Column(DateTime, nullable=False)

    # Relationship
    bed = relationship("Bed", back_populates="log_bed_patient_sensor",lazy="joined")
    patient = relationship("Patient", back_populates="log_bed_patient_sensor",lazy="joined")
    sensor = relationship("Sensor", back_populates="log_bed_patient_sensor",lazy="joined")
    notifications = relationship("Notification", back_populates="log_bed_patient_sensor", uselist=True, cascade="all, delete")


    
