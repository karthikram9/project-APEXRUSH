import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import os

np.random.seed(42)

# -----------------------------
# 1. Generate Synthetic Dataset
# -----------------------------
N = 8000

data = pd.DataFrame()

data["age"] = np.random.randint(18, 80, N)
data["sex"] = np.random.randint(0, 2, N)  # 0=Female, 1=Male
data["height_cm"] = np.random.normal(165, 10, N).clip(140, 200)
data["weight_kg"] = np.random.normal(70, 15, N).clip(40, 140)
data["waist_cm"] = np.random.normal(85, 12, N).clip(60, 130)

data["physical_activity"] = np.random.randint(0, 4, N)  # 0-3
data["sleep_hours"] = np.random.normal(7, 1.5, N).clip(3, 10)
data["stress_level"] = np.random.randint(0, 3, N)
data["family_history_heart"] = np.random.randint(0, 2, N)
data["family_history_diab"] = np.random.randint(0, 2, N)
data["smoking_status"] = np.random.randint(0, 3, N)
data["fried_food"] = np.random.randint(0, 3, N)
data["chest_discomfort"] = np.random.randint(0, 3, N)
data["salt_intake"] = np.random.randint(0, 3, N)
data["sugar_intake"] = np.random.randint(0, 3, N)
data["water_intake"] = np.random.randint(0, 3, N)
data["excessive_thirst"] = np.random.randint(0, 3, N)

# Derived features
data["BMI"] = data["weight_kg"] / ((data["height_cm"] / 100) ** 2)
data["WHR"] = data["waist_cm"] / data["height_cm"]

# -----------------------------
# 2. Generate Risk Scores (0-100)
# -----------------------------
def normalize(score):
    return np.clip(score, 0, 100)

# Heart Risk Formula
heart_score = (
    data["age"] * 0.4 +
    data["smoking_status"] * 10 +
    data["family_history_heart"] * 12 +
    data["physical_activity"] * (-5) +
    data["stress_level"] * 6 +
    data["salt_intake"] * 4 +
    data["chest_discomfort"] * 8 +
    data["BMI"] * 0.7
)

# Diabetes Risk Formula
diab_score = (
    data["age"] * 0.3 +
    data["BMI"] * 1.2 +
    data["family_history_diab"] * 15 +
    data["sugar_intake"] * 8 +
    data["physical_activity"] * (-6) +
    data["sleep_hours"] * (-2) +
    data["excessive_thirst"] * 10
)

# Obesity Risk (WHO-based hybrid)
obesity_score = (
    data["BMI"] * 2 +
    data["WHR"] * 50 +
    data["physical_activity"] * (-5) +
    data["fried_food"] * 6
)

data["heart_risk"] = normalize(heart_score)
data["diabetes_risk"] = normalize(diab_score)
data["obesity_risk"] = normalize(obesity_score)

# -----------------------------
# 3. Save Single CSV File
# -----------------------------
csv_path = "vitalscan_synthetic_dataset.csv"
data.to_csv(csv_path, index=False)

# -----------------------------
# 4. Train Regression Models
# -----------------------------
features = data.drop(columns=["heart_risk", "diabetes_risk", "obesity_risk"])

X_train, X_test, y_train_h, y_test_h = train_test_split(
    features, data["heart_risk"], test_size=0.2, random_state=42
)

_, _, y_train_d, y_test_d = train_test_split(
    features, data["diabetes_risk"], test_size=0.2, random_state=42
)

heart_model = GradientBoostingRegressor(random_state=42)
diab_model = GradientBoostingRegressor(random_state=42)

heart_model.fit(X_train, y_train_h)
diab_model.fit(X_train, y_train_d)

# -----------------------------
# 5. Evaluation
# -----------------------------
def evaluate(model, X_test, y_test):
    pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, pred)
    rmse = np.sqrt(mean_squared_error(y_test, pred))
    r2 = r2_score(y_test, pred)
    mape = np.mean(np.abs((y_test - pred) / y_test)) * 100
    return mae, rmse, r2, mape

heart_metrics = evaluate(heart_model, X_test, y_test_h)
diab_metrics = evaluate(diab_model, X_test, y_test_d)

print("Heart Model Metrics (MAE, RMSE, R2, MAPE):", heart_metrics)
print("Diabetes Model Metrics (MAE, RMSE, R2, MAPE):", diab_metrics)

# -----------------------------
# 6. Save Models
# -----------------------------
joblib.dump(heart_model, "heart_model.pkl")
joblib.dump(diab_model, "diabetes_model.pkl")

print("\nCSV and models generated successfully.")