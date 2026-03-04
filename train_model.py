import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
import joblib

df = pd.read_csv("vitalscan_synthetic_dataset.csv")

X = df.drop(columns=["heart_risk", "diabetes_risk", "obesity_risk"])
y = df["heart_risk"] > 50

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)

joblib.dump(model, "heart_model.pkl")

print("Model saved successfully.")