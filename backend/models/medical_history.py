from sqlalchemy import Column, Integer, String, Date, ForeignKey
from models.base import Base
from sqlalchemy.orm import relationship

class Medical_History(Base):
    __tablename__ = "medical_history"

    med_history_id = Column(Integer, primary_key=True, index=True, nullable=False)
    patient_id = Column(Integer, ForeignKey("patient.patient_id"), nullable=False)
    medical_history_inspect_date = Column(Date, nullable=False)
    medical_history_docter = Column(String(255), nullable=False)
    medical_history_disease = Column(String(255))
    medical_history_type = Column(String(100), nullable=False)
    medical_history_medicine = Column(String(255))
    medical_history_drug_allergy = Column(String(255))
    medical_history_treatment_result = Column(String(255))

    patient = relationship("Patient", back_populates="medical_history")

    


