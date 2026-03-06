import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

ALERT_EMAIL = os.getenv("ALERT_EMAIL")
ALERT_PASSWORD = os.getenv("ALERT_PASSWORD")

def should_send_alert(heart_risk, diabetes_risk, obesity_risk):
    return (
        heart_risk >= 70 or
        diabetes_risk >= 70 or
        obesity_risk >= 70
    )

def build_email_body(user_name, heart_risk, diabetes_risk, obesity_risk):
    risks = []
    advice = []

    if heart_risk >= 70:
        risks.append(f"Heart Disease Risk: {heart_risk:.1f}% — HIGH")
        advice.append("Consult a cardiologist immediately. Avoid smoking, reduce salt intake, and monitor blood pressure.")
    elif heart_risk >= 40:
        risks.append(f"Heart Disease Risk: {heart_risk:.1f}% — MODERATE")

    if diabetes_risk >= 70:
        risks.append(f"Diabetes Risk: {diabetes_risk:.1f}% — HIGH")
        advice.append("Consult an endocrinologist. Reduce sugar intake, increase physical activity, and monitor blood glucose.")
    elif diabetes_risk >= 40:
        risks.append(f"Diabetes Risk: {diabetes_risk:.1f}% — MODERATE")

    if obesity_risk >= 70:
        risks.append(f"Obesity Risk: {obesity_risk:.1f}% — HIGH")
        advice.append("Consult a nutritionist. Focus on a balanced diet and daily physical activity of at least 30 minutes.")
    elif obesity_risk >= 40:
        risks.append(f"Obesity Risk: {obesity_risk:.1f}% — MODERATE")

    risk_lines = "\n".join(f"  • {r}" for r in risks)
    advice_lines = "\n".join(f"  • {a}" for a in advice)

    body = f"""
Dear Family Member,

This is an automated health alert from VitalScan.

{user_name}'s latest health risk assessment has returned HIGH risk scores that require immediate attention.

RISK SCORES
-----------
{risk_lines}

RECOMMENDED ACTIONS
-------------------
{advice_lines}

  • Please encourage {user_name} to consult a doctor as soon as possible.
  • This assessment is based on lifestyle inputs and is not a clinical diagnosis.
  • Early intervention significantly reduces the risk of serious health complications.

---
This alert was sent automatically by VitalScan Health Risk Detection Platform.
Do not reply to this email.
For more information visit your VitalScan dashboard.
"""
    return body

def send_family_alerts(user_name, family_emails, heart_risk, diabetes_risk, obesity_risk):
    if not should_send_alert(heart_risk, diabetes_risk, obesity_risk):
        print("Risk scores below threshold. No alert sent.")
        return {"sent": False, "reason": "Risk below threshold"}

    if not ALERT_EMAIL or not ALERT_PASSWORD:
        print("Email credentials not configured in .env")
        return {"sent": False, "reason": "Email not configured"}

    if not family_emails:
        print("No family contacts to alert.")
        return {"sent": False, "reason": "No family contacts"}

    subject = f"🚨 VitalScan Health Alert — {user_name} Needs Attention"
    body = build_email_body(user_name, heart_risk, diabetes_risk, obesity_risk)

    sent_to = []
    failed = []

    for email in family_emails:
        try:
            msg = MIMEMultipart()
            msg["From"] = ALERT_EMAIL
            msg["To"] = email
            msg["Subject"] = subject
            msg.attach(MIMEText(body, "plain"))

            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                server.login(ALERT_EMAIL, ALERT_PASSWORD)
                server.sendmail(ALERT_EMAIL, email, msg.as_string())

            sent_to.append(email)
            print(f"Alert sent to {email}")
        except Exception as e:
            failed.append(email)
            print(f"Failed to send to {email}: {e}")

    return {
        "sent": True,
        "sent_to": sent_to,
        "failed": failed,
        "heart_risk": heart_risk,
        "diabetes_risk": diabetes_risk,
        "obesity_risk": obesity_risk
    }
