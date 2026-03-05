from pydantic import BaseModel, Field
from typing import Optional

class PredictionRequest(BaseModel):
    age: int = Field(..., ge=18, le=80, description="Age in years")
    sex: int = Field(..., ge=0, le=1, description="0=Female, 1=Male")
    height_cm: float = Field(..., ge=140, le=220, description="Height in cm")
    weight_kg: float = Field(..., ge=40, le=200, description="Weight in kg")
    waist_cm: float = Field(..., ge=50, le=150, description="Waist circumference in cm")
    physical_activity_level: int = Field(..., ge=0, le=3, description="0=Sedentary, 1=Light, 2=Moderate, 3=Active")
    sleep_hours: float = Field(..., ge=3.0, le=12.0, description="Sleep duration in hours")
    stress_level: int = Field(..., ge=0, le=2, description="0=Low, 1=Moderate, 2=High")
    smoking_status: int = Field(..., ge=0, le=2, description="0=Never, 1=Former, 2=Current")
    sugar_intake_level: int = Field(..., ge=0, le=2, description="0=Low, 1=Moderate, 2=High")
    fried_food_consumption: int = Field(..., ge=0, le=2, description="0=Low, 1=Moderate, 2=High")
    water_intake_liters: float = Field(..., description="Water intake in liters: 0.5, 1.5, 3.5, 4.5")
    salt_intake_level: int = Field(..., ge=0, le=2, description="0=Low, 1=Moderate, 2=High")
    chest_discomfort: int = Field(..., ge=0, le=2, description="0=Not Applicable, 1=Moderate, 2=Often")
    excessive_thirst_fatigue: int = Field(..., ge=0, le=2, description="0=Low, 1=Moderate, 2=High")
    family_history_heart: int = Field(..., ge=0, le=1, description="0=No, 1=Yes")
    family_history_diabetes: int = Field(..., ge=0, le=1, description="0=No, 1=Yes")

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
