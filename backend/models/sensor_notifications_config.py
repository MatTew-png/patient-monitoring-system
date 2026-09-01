from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Date, Time, Float
from models.base import Base
from sqlalchemy.orm import relationship

class Sensor_Notifications_Config(Base):
    __tablename__ = "sensor_notifications_config"

    sensor_notifications_config_id = Column(Integer, primary_key=True, index=True, nullable=False)
    sensor_id = Column(Integer, ForeignKey("sensors.sensor_id", ondelete="CASCADE"), nullable=False)
    sensor_notifications_config_event = Column(String(255), nullable=False)
    sensor_notifications_config_usage = Column(Boolean)
    sensor_notifications_config_repeatnoti = Column(Integer)
    sensor_notifications_config_rangetime = Column(Integer)
    sensor_notifications_config_signal = Column(String(50))
    sensor_notifications_config_condition_value = Column(Integer)
    sensor_notifications_config_condition_sign = Column(String(50))
    sensor_notifications_config_condition_unit = Column(String(50))

    sensor = relationship("Sensor", back_populates="sensor_notifications_config")

    notification = relationship("Notification", back_populates="sensor_notifications_config")
    