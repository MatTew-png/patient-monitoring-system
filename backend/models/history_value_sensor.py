from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from models.base import Base
from sqlalchemy.orm import relationship

class History_Value_Sensor(Base):
    __tablename__ = "history_value_sensor"

    history_value_sensor_id = Column(Integer, primary_key=True, index=True, nullable=False)
    sensor_id = Column(Integer, ForeignKey("sensors.sensor_id", ondelete="CASCADE"), nullable=False)
    history_value_sensor_value = Column(String(255), nullable=False)
    history_value_sensor_time = Column(DateTime, nullable=False)

    sensor = relationship("Sensor", back_populates="history_value_sensor")
    

    
