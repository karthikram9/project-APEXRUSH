from fastapi import FastAPI, HTTPException, Request, Depends
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from starlette.responses import JSONResponse
from schemas import PredictionRequest, PredictionResponse
from services.prediction import (
    get_heart_risk_prediction,
    get_diabetes_risk_prediction,
    get_obesity_risk_score,
    get_all_predictions)
from services.diet import generate_diet_plan
from services.alerts import send_family_alerts
import firebase_admin
from firebase_admin import credentials, firestore, auth
import redis
import hashlib
import json
import os
import smtplib
import traceback
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

# ── Rate Limiter ──
limiter = Limiter(key_func=get_remote_address)

# ── FastAPI App ──
app = FastAPI(title="VitalScan API")

# ── CORS — must be first middleware ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5175",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"

    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# ── SlowAPI — after CORS ──
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request, exc):
    return JSONResponse(
        status_code=429,
        content={"detail": "Too many requests. Try again in a minute."})

# ── Firebase Init ──
FIREBASE_AVAILABLE = False
db_firestore = None
try:
    cred_path = os.getenv("FIREBASE_CREDENTIALS", "serviceAccountKey.json")
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
    db_firestore = firestore.client()
    FIREBASE_AVAILABLE = True
    print("[OK] Firebase connected")
except Exception as e:
    print(f"[!] Firebase disabled: {e}")

# ── Redis Init ──
REDIS_AVAILABLE = False
redis_client = None
try:
    redis_client = redis.Redis(
        host='localhost',
        port=6379,
        db=0,
        decode_responses=True,
        socket_connect_timeout=2)
    redis_client.ping()
    REDIS_AVAILABLE = True
    print("[OK] Redis connected")
except Exception as e:
    print(f"[!] Redis disabled: {e}")

# ── Token Verifier ──
def verify_token(request: Request):
    token = request.headers.get("Authorization", "")
    if token.startswith("Bearer "):
        token = token[7:]
    if not token:
        return None
    try:
        decoded = auth.verify_id_token(token)
        return decoded.get("uid")
    except Exception:
        return None

# ── Health Check ──
@app.get("/health")
async def health():
    return {
        "status": "VitalScan API running",
        "firebase": FIREBASE_AVAILABLE,
        "redis": REDIS_AVAILABLE
    }

# ── Predict Endpoint ──
@app.post("/predict", response_model=PredictionResponse)
@limiter.limit("20/minute")
async def predict(
    request: Request,
    body: PredictionRequest):
    try:
        request_dict = body.model_dump()
        
        data_values = [
            float(body.age),
            float(body.sex),
            float(body.height_cm),
            float(body.weight_kg),
            float(body.waist_cm),
            float(body.physical_activity_level),
            float(body.sleep_hours),
            float(body.stress_level),
            float(body.smoking_status),
            float(body.sugar_intake_level),
            float(body.fried_food_consumption),
            float(body.water_intake_liters),
            float(body.salt_intake_level),
            float(body.chest_discomfort),
            float(body.excessive_thirst_fatigue),
            float(body.family_history_heart),
            float(body.family_history_diabetes)
        ]

        print(f"[OK] Features: {len(data_values)}")

        # Redis cache check
        req_str = json.dumps(request_dict, sort_keys=True)
        req_hash = hashlib.sha256(req_str.encode()).hexdigest()
        cache_key = f"predict:{req_hash}"

        if REDIS_AVAILABLE and redis_client:
            cached = redis_client.get(cache_key)
            if cached:
                print("[OK] Cache hit")
                return json.loads(cached)

        # Run predictions using unified model
        all_preds = get_all_predictions(data_values)
        heart_risk = all_preds["heart_risk"]
        diabetes_risk = all_preds["diabetes_risk"]
        obesity_score = all_preds["obesity_risk"]

        # Calculate BMI
        height_m = body.height_cm / 100.0
        bmi = body.weight_kg / (height_m * height_m) if height_m > 0 else 0
        bmi = round(bmi, 1)

        if bmi < 18.5:
            bmi_category = "Underweight"
        elif bmi < 25.0:
            bmi_category = "Normal"
        elif bmi < 30.0:
            bmi_category = "Overweight"
        elif bmi < 35.0:
            bmi_category = "Obese Class I"
        elif bmi < 40.0:
            bmi_category = "Obese Class II"
        else:
            bmi_category = "Obese Class III"

        # Calculate WHtR
        whtr = body.waist_cm / body.height_cm if body.height_cm > 0 else 0
        whtr = round(whtr, 3)

        if whtr < 0.4:
            whtr_category = "Underweight Risk"
        elif whtr < 0.5:
            whtr_category = "Healthy"
        elif whtr < 0.6:
            whtr_category = "Overweight Risk"
        else:
            whtr_category = "High Obesity Risk"

        heart_category = "High" if heart_risk > 60 else "Moderate" if heart_risk > 30 else "Low"
        diabetes_category = "High" if diabetes_risk > 60 else "Moderate" if diabetes_risk > 30 else "Low"
        obesity_category = "High" if obesity_score > 60 else "Moderate" if obesity_score > 30 else "Low"

        result = {
            "heart_risk_percent": heart_risk,
            "heart_risk_category": heart_category,
            "heart_top_factors": [
                {"factor": "smoking_status", "contribution_percent": 20.5, "label": "Smoking Status"},
                {"factor": "physical_activity_level", "contribution_percent": 15.3, "label": "Physical Activity"},
                {"factor": "stress_level", "contribution_percent": 12.1, "label": "Stress Level"}
            ],
            "diabetes_risk_percent": diabetes_risk,
            "diabetes_risk_category": diabetes_category,
            "diabetes_top_factors": [
                {"factor": "family_history_diabetes", "contribution_percent": 18.2, "label": "Family History"},
                {"factor": "sugar_intake_level", "contribution_percent": 14.5, "label": "Sugar Intake"},
                {"factor": "physical_activity_level", "contribution_percent": 10.3, "label": "Physical Activity"}
            ],
            "obesity_risk_percent": obesity_score,
            "obesity_risk_category": obesity_category,
            "obesity_bmi": bmi,
            "obesity_bmi_category": bmi_category,
            "obesity_whtr": whtr,
            "obesity_whtr_category": whtr_category,
            "obesity_top_factors": [
                {"factor": "weight_kg", "contribution_percent": 40.0, "label": "Body Weight"},
                {"factor": "waist_cm", "contribution_percent": 25.0, "label": "Waist Circumference"},
                {"factor": "fried_food_consumption", "contribution_percent": 15.0, "label": "Junk Food Consumption"}
            ]
        }

        # Cache result
        if REDIS_AVAILABLE and redis_client:
            redis_client.setex(cache_key, 3600, json.dumps(result))

        # Save to Firestore
        uid = verify_token(request)
        if FIREBASE_AVAILABLE and db_firestore and uid:
            try:
                db_firestore.collection("predictions").add({
                    "userId": uid,
                    "results": result,
                    "inputs": request_dict,
                    "timestamp": firestore.SERVER_TIMESTAMP
                })
            except Exception as fe:
                print(f"Firestore error: {fe}")

        return result

    except Exception as e:
        print("[X] PREDICT ERROR:", str(e))
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

# ── Diet Endpoint ──
@app.post("/diet")
async def diet(request: Request):
    try:
        body = await request.json()
        heart_risk = float(body.get("heart_risk", 0))
        diabetes_risk = float(body.get("diabetes_risk", 0))
        obesity_risk = float(body.get("obesity_risk", 0))
        medications = body.get("medications", [])

        plan = generate_diet_plan(heart_risk, diabetes_risk, obesity_risk, medications)
        return plan

    except Exception as e:
        print("[X] DIET ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

# ── Send Alert Endpoint ──
@app.post("/send-alert")
async def send_alert(request: Request):
    try:
        uid = verify_token(request)
        if not uid:
            raise HTTPException(status_code=401, detail="Unauthorized")

        body = await request.json()
        user_name = body.get("userName", "User")
        heart_risk = body.get("heartRisk", 0)
        diabetes_risk = body.get("diabetesRisk", 0)
        obesity_risk = body.get("obesityRisk", 0)
        family_emails = body.get("familyEmails", [])

        if not family_emails:
            return {"sent": 0, "message": "No family emails"}

        smtp_email = os.getenv("ALERT_EMAIL")
        smtp_pass = os.getenv("ALERT_PASSWORD")

        if not smtp_email or not smtp_pass:
            return {"sent": 0, "message": "SMTP not configured"}

        sent_count = 0
        for recipient in family_emails:
            try:
                msg = MIMEMultipart()
                msg["From"] = smtp_email
                msg["To"] = recipient["email"]
                msg["Subject"] = f"Health Alert: {user_name}'s Risk Score Requires Attention"

                body_text = f"""
Dear {recipient.get('name', 'Family Member')},

This is an automated health alert from VitalScan.

{user_name}'s latest health risk assessment shows:

Heart Disease Risk  : {heart_risk}%
Diabetes Risk       : {diabetes_risk}%
Obesity Risk        : {obesity_risk}%

One or more scores indicate HIGH RISK.
We strongly recommend consulting a doctor soon.

This alert was sent because {user_name} added your email for family health monitoring on VitalScan.

— VitalScan Health Intelligence
* Educational tool only. Not a medical diagnosis. Consult a doctor for clinical evaluation.
                """

                msg.attach(MIMEText(body_text, "plain"))

                with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                    server.login(smtp_email, smtp_pass)
                    server.send_message(msg)

                sent_count += 1
                print(f"[OK] Alert sent to {recipient['email']}")

            except Exception as email_err:
                print(f"[X] Email failed: {email_err}")

        return {
            "sent": sent_count,
            "total": len(family_emails),
            "message": f"Alerts sent to {sent_count} recipients"
        }

    except Exception as e:
        print("[X] ALERT ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))
class AlertRequest(BaseModel):
    user_name: str
    family_emails: list[str]
    heart_risk: float
    diabetes_risk: float
    obesity_risk: float

@app.post("/send-alerts")
async def send_alerts(request: AlertRequest):
    result = send_family_alerts(
        user_name=request.user_name,
        family_emails=request.family_emails,
        heart_risk=request.heart_risk,
        diabetes_risk=request.diabetes_risk,
        obesity_risk=request.obesity_risk
    )
    return result
