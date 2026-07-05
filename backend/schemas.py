from pydantic import BaseModel
from typing import Optional

class PredictionRequest(BaseModel):
    age: float
    sex: int
    height_cm: float
    weight_kg: float
    waist_cm: float
    physical_activity_level: int
    sleep_hours: float
    stress_level: int
    smoking_status: int
    sugar_intake_level: int
    fried_food_consumption: int
    water_intake_liters: float
    salt_intake_level: int
    chest_discomfort: int
    excessive_thirst_fatigue: int
    family_history_heart: int
    family_history_diabetes: int

class PredictionResponse(BaseModel):
    heart_risk_percent: float
    heart_risk_category: str
    heart_top_factors: list
    diabetes_risk_percent: float
    diabetes_risk_category: str
    diabetes_top_factors: list
    obesity_risk_percent: float
    obesity_risk_category: str
    obesity_bmi: float
    obesity_bmi_category: str
    obesity_whtr: float
    obesity_whtr_category: str
    obesity_top_factors: list
