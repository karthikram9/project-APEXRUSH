import emailjs from '@emailjs/browser'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

const getRiskLabel = (score) => {
    if (score >= 70) return 'HIGH ⚠️'
    if (score >= 40) return 'MODERATE'
    return 'LOW ✅'
}

const getHeartAdvice = (score) => {
    if (score >= 70) return '❤️ Heart risk is HIGH. Consult a cardiologist immediately. Avoid smoking, reduce salt intake, and monitor blood pressure daily.'
    if (score >= 40) return '❤️ Heart risk is MODERATE. Reduce saturated fats, exercise regularly, and monitor blood pressure.'
    return ''
}

const getDiabetesAdvice = (score) => {
    if (score >= 70) return '🩸 Diabetes risk is HIGH. Consult an endocrinologist immediately. Eliminate sugary foods and drinks and monitor blood glucose.'
    if (score >= 40) return '🩸 Diabetes risk is MODERATE. Reduce refined carbohydrates and increase physical activity.'
    return ''
}

const getObesityAdvice = (score) => {
    if (score >= 70) return '⚖️ Obesity risk is HIGH. Consult a nutritionist immediately. Focus on a calorie-controlled diet and 30 minutes of daily activity.'
    if (score >= 40) return '⚖️ Obesity risk is MODERATE. Monitor calorie intake and increase daily movement.'
    return ''
}

const shouldSendAlert = (heartRisk, diabetesRisk, obesityRisk) => {
    return heartRisk >= 70 || diabetesRisk >= 70 || obesityRisk >= 70
}

const buildTemplateParams = (
    toName,
    toEmail,
    userName,
    heartRisk,
    diabetesRisk,
    obesityRisk
) => ({
    to_name: toName,
    to_email: toEmail,
    user_name: userName,
    heart_risk: heartRisk.toFixed(1),
    diabetes_risk: diabetesRisk.toFixed(1),
    obesity_risk: obesityRisk.toFixed(1),
    heart_label: getRiskLabel(heartRisk),
    diabetes_label: getRiskLabel(diabetesRisk),
    obesity_label: getRiskLabel(obesityRisk),
    heart_advice: getHeartAdvice(heartRisk),
    diabetes_advice: getDiabetesAdvice(diabetesRisk),
    obesity_advice: getObesityAdvice(obesityRisk),
})

export const sendAlertEmails = async (
    userName,
    userEmail,
    familyContacts,
    heartRisk,
    diabetesRisk,
    obesityRisk
) => {
    if (!shouldSendAlert(heartRisk, diabetesRisk, obesityRisk)) {
        console.log('All scores below 70%. No alert sent.')
        return { sent: false, reason: 'Scores below threshold' }
    }

    emailjs.init(PUBLIC_KEY)

    const results = []

    // Send to the user themselves
    try {
        await emailjs.send(
            SERVICE_ID,
            TEMPLATE_ID,
            buildTemplateParams(
                userName,
                userEmail,
                userName,
                heartRisk,
                diabetesRisk,
                obesityRisk
            )
        )
        results.push({ email: userEmail, status: 'sent' })
        console.log('Alert sent to user:', userEmail)
    } catch (e) {
        results.push({ email: userEmail, status: 'failed', error: e.text })
        console.error('Failed to send to user:', e)
    }

    // Send to each family contact
    for (const contact of familyContacts) {
        if (!contact.email) continue
        try {
            await emailjs.send(
                SERVICE_ID,
                TEMPLATE_ID,
                buildTemplateParams(
                    contact.name || 'Family Member',
                    contact.email,
                    userName,
                    heartRisk,
                    diabetesRisk,
                    obesityRisk
                )
            )
            results.push({ email: contact.email, status: 'sent' })
            console.log('Alert sent to family contact:', contact.email)
        } catch (e) {
            results.push({ email: contact.email, status: 'failed', error: e.text })
            console.error('Failed to send to family contact:', contact.email, e)
        }
    }

    return { sent: true, results }
}
