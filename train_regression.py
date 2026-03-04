import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor
import joblib

# Load CSV
df = pd.read_csv("vitalscan_synthetic_dataset.csv")

# Features and target
X = df.drop(columns=["heart_risk", "diabetes_risk", "obesity_risk"])
y = df["heart_risk"]   # Now use real percentage

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train regression model
model = GradientBoostingRegressor(random_state=42)
model.fit(X_train, y_train)

# Save model
joblib.dump(model, "heart_regression_model.pkl")

print("Regression model saved successfully.")