from sqlalchemy import Column, DateTime, Integer, String, Date
from models.base import Base
from sqlalchemy.orm import relationship


class Patient(Base):
    __tablename__ = "patient"

    patient_id = Column(Integer, primary_key=True, index=True, nullable=False)
    patient_name = Column(String(255), nullable=False)
    patient_age = Column(Integer, nullable=False)
    patient_gender = Column(String(10), nullable=False)
    patient_dob = Column(Date, nullable=False)
    patient_disease = Column(String(255))
    patient_status = Column(String(50), nullable=False)
    patient_date_in = Column(Date, nullable=False)
    patient_bloodtype = Column(String(5))
    deleted_at = Column(DateTime, nullable=True, index=True)
    image_path = Column(String(255), nullable=True)

    bed = relationship("Bed", back_populates="patient", uselist=False)

    medical_history = relationship("Medical_History", back_populates="patient")

    medical_information = relationship("Medical_Information", back_populates="patient")

    personal_behavior = relationship("Personal_Behavior", back_populates="patient")

    log_bed_patient_sensor = relationship("Log_Bed_Patient_Sensor", back_populates="patient")
