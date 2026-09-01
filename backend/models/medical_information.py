from sqlalchemy import Column, Float, Integer, String, Date, ForeignKey
from models.base import Base
from sqlalchemy.orm import relationship

class Medical_Information(Base):
    __tablename__ = "medical_information"

    medical_info_id = Column(Integer, primary_key=True, index=True, nullable=False)
    patient_id = Column(Integer, ForeignKey("patient.patient_id"), nullable=False)
    medical_info_record_date = Column(Date, nullable=False)
    medical_info_blood_pressure = Column(String(20))
    medical_info_pulse = Column(Integer)
    medical_info_respiration_rate = Column(Integer)
    medical_info_weight = Column(Float)
    medical_info_height = Column(Float)

    patient = relationship("Patient", back_populates="medical_information")



