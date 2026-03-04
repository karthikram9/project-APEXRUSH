from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from schemas import PredictionRequest
from services.prediction import get_heart_risk_prediction
from services.diabetes import get_diabetes_risk_prediction
from services.obesity import assess_obesity
from services.diet import generate_diet_plan
from database import engine, Base, SessionLocal, redis_client
from models_db import Prediction
from sqlalchemy.orm import Session
import json
import hashlib
import redis

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/predict")
def predict(request: PredictionRequest, db: Session = Depends(get_db)):
    request_dict = request.model_dump()
    
    # Create request hash for caching
    request_str = json.dumps(request_dict, sort_keys=True)
    request_hash = hashlib.sha256(request_str.encode()).hexdigest()
    cache_key = f"predict:{request_hash}"
    
    # Check cache
    try:
        cached_result = redis_client.get(cache_key)
        if cached_result:
            return json.loads(cached_result)
    except redis.exceptions.ConnectionError:
        pass # Graceful fallback

    data_values = list(request_dict.values())
    
    # Predictions
    heart_risk_percent = get_heart_risk_prediction(data_values)
    diabetes_risk_percent = get_diabetes_risk_prediction(data_values)
    obesity_assessment = assess_obesity(request.BMI, request.WHR, request.sex)
    
    # Save to db (use default 0.0 for missing float columns)
    db_pred = Prediction(
        heart_risk=heart_risk_percent,
        diabetes_risk=diabetes_risk_percent,
        obesity_risk=0.0,
        input_data=request_dict
    )
    db.add(db_pred)
    db.commit()
    db.refresh(db_pred)
    
    result = {
        "heart_risk_percent": heart_risk_percent,
        "diabetes_risk_percent": diabetes_risk_percent,
        "obesity_assessment": obesity_assessment
    }
    
    # Cache result
    try:
        redis_client.setex(cache_key, 3600, json.dumps(result))
    except redis.exceptions.ConnectionError:
        pass
    
    return result

class DietRequest(BaseModel):
    heart_risk: float
    diabetes_risk: float
    obesity_risk: float
    medications: List[str]

@app.post("/diet")
def diet(request: DietRequest):
    return generate_diet_plan(
        heart_risk=request.heart_risk,
        diabetes_risk=request.diabetes_risk,
        obesity_risk=request.obesity_risk,
        medications=request.medications
    )
