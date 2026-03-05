def generate_diet_plan(
    heart_risk: float,
    diabetes_risk: float,
    obesity_risk: float,
    medications: list) -> dict:

    foods_to_eat = []
    foods_to_avoid = []
    lifestyle_tips = []
    priority_actions = []

    # Heart risk rules
    if heart_risk >= 60:
        foods_to_eat.extend([
            "Fatty fish (salmon, mackerel)",
            "Oats and whole grains",
            "Leafy greens (spinach, kale)",
            "Nuts (walnuts, almonds)",
            "Olive oil",
            "Berries and citrus fruits"
        ])
        foods_to_avoid.extend([
            "Fried and processed foods",
            "High sodium snacks",
            "Red meat (limit to once/week)",
            "Butter and trans fats",
            "Sugary beverages"
        ])
        lifestyle_tips.extend([
            "Walk 30 minutes daily",
            "Reduce salt intake",
            "Quit smoking immediately",
            "Monitor blood pressure weekly"
        ])
        priority_actions.append(
            "Consult a cardiologist soon")

    # Diabetes risk rules
    if diabetes_risk >= 60:
        foods_to_eat.extend([
            "Brown rice and millets",
            "Bitter gourd (karela)",
            "Fenugreek seeds",
            "Low glycemic fruits (apple, pear, guava)",
            "Legumes and lentils",
            "Greek yogurt (unsweetened)"
        ])
        foods_to_avoid.extend([
            "White rice and white bread",
            "Sugary sweets and desserts",
            "Fruit juices and sodas",
            "High sugar fruits (mango, banana in excess)",
            "Refined carbohydrates"
        ])
        lifestyle_tips.extend([
            "Eat small meals every 3-4 hours",
            "Check fasting glucose monthly",
            "Exercise after meals — 15 min walk",
            "Reduce refined sugar completely"
        ])
        priority_actions.append(
            "Get HbA1c blood test done")

    # Obesity risk rules
    if obesity_risk >= 60:
        foods_to_eat.extend([
            "High protein foods (eggs, chicken, legumes)",
            "Vegetables (unlimited leafy)",
            "Cucumber, tomato, sprouts",
            "Green tea",
            "Whole fruits not juices"
        ])
        foods_to_avoid.extend([
            "Junk food and fast food",
            "Calorie-dense snacks",
            "Alcohol",
            "Late night eating",
            "Packaged and ultra-processed food"
        ])
        lifestyle_tips.extend([
            "Drink 3 litres water daily",
            "Sleep 7-8 hours consistently",
            "Track daily calorie intake",
            "Strength training 3x per week"
        ])
        priority_actions.append(
            "Start a structured diet plan with a nutritionist")

    # Low risk baseline
    if (heart_risk < 60 
            and diabetes_risk < 60 
            and obesity_risk < 60):
        foods_to_eat = [
            "Balanced diet with all food groups",
            "5 servings fruits and vegetables",
            "Whole grains and legumes",
            "Lean protein sources",
            "Plenty of water"
        ]
        foods_to_avoid = [
            "Excessive junk food",
            "Sugary beverages",
            "Ultra-processed foods"
        ]
        lifestyle_tips = [
            "Maintain current healthy habits",
            "Exercise 30 minutes 5x per week",
            "Annual health checkup recommended"
        ]
        priority_actions = [
            "Continue current lifestyle",
            "Reassess risk in 6 months"
        ]

    # Medication adjustments
    if "blood_thinners" in medications:
        foods_to_avoid.append(
            "High Vitamin K foods (spinach, kale — limit intake)")
        lifestyle_tips.append(
            "Maintain consistent Vitamin K intake — consult doctor before changes")

    if "bp_medication" in medications:
        foods_to_avoid.append(
            "High potassium foods in excess (bananas, oranges — ask doctor)")
        lifestyle_tips.append(
            "Monitor BP daily at same time")

    if "diabetes_medication" in medications:
        foods_to_avoid.append(
            "High sugar fruits (mangoes, grapes in large qty)")
        lifestyle_tips.append(
            "Never skip meals when on diabetes medication")

    if "cholesterol_medication" in medications:
        foods_to_avoid.append(
            "Grapefruit and grapefruit juice (interacts with statins)")
        lifestyle_tips.append(
            "Take medication at same time daily")

    # Remove duplicates
    foods_to_eat = list(dict.fromkeys(foods_to_eat))
    foods_to_avoid = list(dict.fromkeys(foods_to_avoid))
    lifestyle_tips = list(dict.fromkeys(lifestyle_tips))

    return {
        "foods_to_eat": foods_to_eat[:8],
        "foods_to_avoid": foods_to_avoid[:8],
        "lifestyle_tips": lifestyle_tips[:6],
        "priority_actions": priority_actions[:3]
    }
