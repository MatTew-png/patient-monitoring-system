from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from models.base import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    ward_id = Column(Integer, ForeignKey("wards.ward_id", ondelete="SET NULL"), nullable=True)
    user_name = Column(String(255), nullable=False)
    user_position = Column(String(255), nullable=False)
    user_username = Column(String(255), unique=True, nullable=False)
    user_password = Column(String(255), nullable=False)
    deleted_at = Column(DateTime, nullable=True, index=True)
    image_path = Column(String(255), nullable=True)

    ward = relationship("Ward", back_populates="user")
    