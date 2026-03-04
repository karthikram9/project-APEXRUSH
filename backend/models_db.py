from sqlalchemy import Column, Integer, Float, JSON, DateTime
from sqlalchemy.sql import func
from database import Base

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    heart_risk = Column(Float)
    diabetes_risk = Column(Float)
    obesity_risk = Column(Float)
    input_data = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())