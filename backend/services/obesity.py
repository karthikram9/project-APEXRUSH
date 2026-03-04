def assess_obesity(bmi: float, whr: float, sex: float) -> dict:
    """
    Assess obesity based on WHO thresholds for BMI and WHR.
    Assuming sex encoding: 1 for Male, 0 for Female.
    """
    # BMI assessment (WHO classification)
    if bmi < 18.5:
        bmi_status = "Underweight"
    elif bmi < 25.0:
        bmi_status = "Normal weight"
    elif bmi < 30.0:
        bmi_status = "Pre-obesity"
    elif bmi < 35.0:
        bmi_status = "Obesity class I"
    elif bmi < 40.0:
        bmi_status = "Obesity class II"
    else:
        bmi_status = "Obesity class III"
        
    # WHR assessment (WHO thresholds for metabolic risk)
    # Men: >= 0.90, Women: >= 0.85
    whr_threshold = 0.90 if sex == 1 else 0.85
    whr_risk = "High" if whr >= whr_threshold else "Normal"
        
    return {
        "bmi_category": bmi_status,
        "whr_risk": whr_risk
    }
