from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from models.base import Base
from sqlalchemy.orm import relationship

class Notification(Base):
    __tablename__ = "notifications"

    notification_id = Column(Integer, primary_key=True, index=True, nullable=False)
    log_bed_patient_sensor_id = Column(Integer, ForeignKey("log_bed_patient_sensor.log_bed_patient_sensor_id", ondelete="CASCADE"), nullable=False)  # เพิ่ม Foreign Key
    sensor_notifications_config_id = Column(Integer, ForeignKey("sensor_notifications_config.sensor_notifications_config_id", ondelete="CASCADE"), nullable=False)
    notification_successed = Column(Boolean)
    notification_category = Column(String(100))
    notification_accepted = Column(Boolean)
    notification_createdate = Column(DateTime)  
    notification_updatedate = Column(DateTime)  

    # Relationships
    log_bed_patient_sensor = relationship("Log_Bed_Patient_Sensor", back_populates="notifications")
    sensor_notifications_config = relationship("Sensor_Notifications_Config", back_populates="notification")
