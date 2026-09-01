from sqlalchemy import Column, ForeignKey, Integer, String, Date, Time, Float
from models.base import Base
from sqlalchemy.orm import relationship

class Personal_Behavior(Base):
    __tablename__ = "personal_behavior"

    personal_behavior_id = Column(Integer, primary_key=True, index=True, nullable=False)
    patient_id = Column(Integer, ForeignKey("patient.patient_id"), nullable=False)
    personal_behavior_date = Column(Date, nullable=False)
    personal_behavior_wake_time = Column(Time)
    personal_behavior_duration = Column(Float)
    personal_behavior_position = Column(String(50))
    personal_behavior_sleep_interruption_count = Column(Integer)
    personal_behavior_fall_asleep_time = Column(Time)
    personal_behavior_noise_disruption_count = Column(Integer)
    personal_behavior_out_of_bed_duration = Column(Float)

    patient = relationship("Patient", back_populates="personal_behavior")