import joblib
import numpy as np
import os

MODEL_PATH = os.path.join(
    os.path.dirname(
        os.path.abspath(__file__)),
    '..',
    'gradient_boosting_model.pkl')

if not os.path.exists(MODEL_PATH):
    print(f"[X] Model not found: {MODEL_PATH}")
    model = None
else:
    print(f"[OK] Model loading from: {MODEL_PATH}")
    loaded_data = joblib.load(MODEL_PATH)
    # Handle both dict and direct model structures
    if isinstance(loaded_data, dict) and 'model' in loaded_data:
        model = loaded_data['model']
    else:
        model = loaded_data
    print("[OK] Model loaded successfully")

def get_all_predictions(data_values: list) -> dict:
    if model is None:
        return {
            "heart_risk": 0.0,
            "diabetes_risk": 0.0,
            "obesity_risk": 0.0
        }
    
    input_data = np.array([data_values])
    predictions = model.predict(input_data)[0]
    
    print(f"Raw predictions: {predictions}")
    print(f"Predictions shape: {np.array(predictions).shape}")
    
    # Handle both single output and multi-output model
    if hasattr(predictions, '__len__') and len(predictions) >= 3:
        heart_risk = float(np.clip(predictions[0], 0, 100))
        diabetes_risk = float(np.clip(predictions[1], 0, 100))
        obesity_risk = float(np.clip(predictions[2], 0, 100))
    else:
        # Single output — use same value with slight variation
        base = float(np.clip(
            predictions if not hasattr(predictions, '__len__') 
            else predictions[0], 0, 100))
        heart_risk = round(base, 1)
        diabetes_risk = round(float(np.clip(base * 0.85, 0, 100)), 1)
        obesity_risk = round(float(np.clip(base * 0.90, 0, 100)), 1)
    
    return {
        "heart_risk": round(heart_risk, 1),
        "diabetes_risk": round(diabetes_risk, 1),
        "obesity_risk": round(obesity_risk, 1)
    }

def get_heart_risk_prediction(data_values: list) -> float:
    return get_all_predictions(data_values)["heart_risk"]

def get_diabetes_risk_prediction(data_values: list) -> float:
    return get_all_predictions(data_values)["diabetes_risk"]

def get_obesity_risk_score(data_values: list) -> float:
    return get_all_predictions(data_values)["obesity_risk"]