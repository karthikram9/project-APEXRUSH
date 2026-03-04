import joblib
import numpy as np
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.path.join(BASE_DIR, "diabetes_model.pkl")

model = joblib.load(MODEL_PATH)

def get_diabetes_risk_prediction(data_values: list) -> float:
    input_data = np.array([data_values])
    prediction = model.predict(input_data)[0]
    return round(float(prediction), 1)
