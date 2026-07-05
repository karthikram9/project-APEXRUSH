import joblib
import os

model_path = r"c:\Users\karthikpc\VitalScan-Ai\backend\gradient_boosting_model.pkl"

if os.path.exists(model_path):
    data = joblib.load(model_path)
    print(f"Type of loaded data: {type(data)}")
    if isinstance(data, dict):
        print("Keys in dictionary:")
        for key in data.keys():
            if key != 'model':
                print(f"- {key}: {data[key]}")
            else:
                print("- model: <scikit-learn model object>")
    else:
        print("Loaded data is not a dictionary.")
else:
    print("Model file not found.")
