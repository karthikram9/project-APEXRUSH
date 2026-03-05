import requests
import json
import time

# Test data (valid inputs)
test_data = {
    "age": 34,
    "sex": 1,
    "height_cm": 170.0,
    "weight_kg": 75.0,
    "waist_cm": 88.0,
    "physical_activity_level": 2,
    "sleep_hours": 7.5,
    "stress_level": 1,
    "smoking_status": 2,
    "sugar_intake_level": 1,
    "fried_food_consumption": 1,
    "water_intake_liters": 2.0,
    "salt_intake_level": 1,
    "chest_discomfort": 0,
    "excessive_thirst_fatigue": 0,
    "family_history_heart": 0,
    "family_history_diabetes": 1
}

# Wait for server to be ready just in case
print("Testing predict endpoint...")

# Send to backend
try:
    response = requests.post('http://localhost:8000/predict', json=test_data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

    # Expected response has these keys:
    expected_keys = [
        'heart_risk_percent', 'heart_risk_category', 'heart_top_factors',
        'diabetes_risk_percent', 'diabetes_risk_category', 'diabetes_top_factors',
        'obesity_risk_percent', 'obesity_risk_category', 'obesity_bmi', 'obesity_bmi_category',
        'obesity_whtr', 'obesity_whtr_category', 'obesity_top_factors'
    ]

    result = response.json()
    all_present = all(key in result for key in expected_keys)
    print(f"All expected keys present: {all_present}")
    if not all_present:
        missing = [k for k in expected_keys if k not in result]
        print(f"Missing keys: {missing}")

except Exception as e:
    print(f"Failed to connect: {e}")
