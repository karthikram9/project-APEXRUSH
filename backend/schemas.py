from pydantic import BaseModel

class PredictionRequest(BaseModel):
    age: float
    sex: float
    height_cm: float
    weight_kg: float
    waist_cm: float
    physical_activity: float
    sleep_hours: float
    stress_level: float
    family_history_heart: float
    family_history_diab: float
    smoking_status: float
    fried_food: float
    chest_discomfort: float
    salt_intake: float
    sugar_intake: float
    water_intake: float
    excessive_thirst: float
    BMI: float
    WHR: float
