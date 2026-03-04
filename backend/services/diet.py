def generate_diet_plan(heart_risk: float, diabetes_risk: float, obesity_risk: float, medications: list) -> dict:
    foods_to_eat = []
    foods_to_avoid = []
    lifestyle_tips = []
    priority_actions = []

    if heart_risk > 60:
        foods_to_eat.extend(["Low sodium foods", "Omega-3 rich foods"])
        foods_to_avoid.extend(["Fried food"])
        priority_actions.append("Monitor heart health and reduce saturated fat.")

    if diabetes_risk > 60:
        foods_to_eat.extend(["Low glycemic index foods", "High fiber foods"])
        foods_to_avoid.extend(["Sugar", "Sugary foods"])
        priority_actions.append("Control blood sugar levels.")

    if obesity_risk > 60:
        foods_to_eat.extend(["High protein foods", "Calorie deficit foods"])
        lifestyle_tips.append("Maintain a caloric deficit and exercise regularly.")
        priority_actions.append("Focus on weight management.")

    # Medication adjustments
    meds = [m.lower() for m in medications]
    if "blood_thinners" in meds:
        foods_to_avoid.append("Vitamin K foods")
    if "diabetes_medication" in meds:
        foods_to_avoid.append("High sugar fruits")
    if "bp_medication" in meds:
        foods_to_avoid.append("High potassium foods")

    # Remove duplicates while preserving order
    foods_to_eat = list(dict.fromkeys(foods_to_eat))
    foods_to_avoid = list(dict.fromkeys(foods_to_avoid))
    lifestyle_tips = list(dict.fromkeys(lifestyle_tips))
    priority_actions = list(dict.fromkeys(priority_actions))

    return {
        "foods_to_eat": foods_to_eat,
        "foods_to_avoid": foods_to_avoid,
        "lifestyle_tips": lifestyle_tips,
        "priority_actions": priority_actions
    }
