import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const getRiskLabel = (score) => {
    if (score >= 70) return 'HIGH'
    if (score >= 40) return 'MODERATE'
    return 'LOW'
}

const getRiskColor = (score) => {
    if (score >= 70) return [180, 30, 30]
    if (score >= 40) return [180, 120, 0]
    return [30, 130, 60]
}

const getAdvice = (type, score) => {
    if (type === 'heart') {
        if (score >= 70) return 'Consult a cardiologist immediately. Avoid smoking, reduce salt and saturated fat intake, monitor blood pressure daily, and begin supervised cardiac exercise.'
        if (score >= 40) return 'Reduce saturated fats and sodium, exercise 30 mins daily, monitor blood pressure weekly, and avoid smoking.'
        return 'Maintain current habits. Continue regular physical activity and a heart-healthy diet low in saturated fats.'
    }
    if (type === 'diabetes') {
        if (score >= 70) return 'Consult an endocrinologist immediately. Eliminate sugary foods and drinks, monitor fasting blood glucose daily, and begin structured physical activity.'
        if (score >= 40) return 'Reduce refined carbohydrates and sugar, increase dietary fiber, exercise regularly, and monitor blood sugar monthly.'
        return 'Maintain current habits. Monitor sugar intake and stay physically active at least 5 days per week.'
    }
    if (type === 'obesity') {
        if (score >= 70) return 'Consult a nutritionist immediately. Follow a calorie-controlled diet, engage in 45 mins of daily activity, track BMI monthly, and avoid processed foods.'
        if (score >= 40) return 'Monitor daily calorie intake, increase movement, reduce processed and fried foods, and track weight weekly.'
        return 'Maintain current weight through regular activity and a balanced whole-food diet.'
    }
}

const getKeyFactors = (inputs = {}) => {
    const factors = []
    // Map payload numeric values to risk conditions
    if (inputs.smoking_status === 2) factors.push('Active smoker — significantly elevates heart and lung risk')
    if (inputs.family_history_heart === 1) factors.push('Family history of heart disease — genetic predisposition present')
    if (inputs.family_history_diabetes === 1) factors.push('Family history of diabetes — hereditary risk factor identified')
    if (inputs.stress_level === 2) factors.push('High stress levels — contributes to hormonal imbalance and weight gain')
    if (inputs.physical_activity_level === 0) factors.push('Sedentary lifestyle — low physical activity increases all three risk scores')
    if (inputs.sugar_intake_level === 2) factors.push('High sugar intake — primary driver of diabetes and obesity risk')
    if (inputs.salt_intake_level === 2) factors.push('High salt intake — major contributor to hypertension and heart disease')
    if (inputs.fried_food_consumption === 2) factors.push('High junk food consumption — elevates BMI and cardiovascular risk')
    if (inputs.chest_discomfort === 2) factors.push('Frequent chest discomfort — requires immediate cardiac evaluation')
    if (inputs.excessive_thirst_fatigue === 2) factors.push('Excessive thirst — potential early indicator of diabetes')
    if (inputs.sleep_hours < 6) factors.push('Insufficient sleep — disrupts metabolism and increases disease risk')
    if (inputs.water_intake_liters < 1.0) factors.push('Very low water intake — affects kidney function and metabolism')

    if (factors.length === 0) factors.push('No critical lifestyle risk factors identified at this time')
    return factors.slice(0, 6)
}

const BROWN = [92, 64, 32]
const DARK = [30, 30, 30]
const LIGHT_BG = [250, 247, 242]
const SECTION_BG = [120, 85, 45] // slightly warmer brown
const WHITE = [255, 255, 255]
const BORDER = [210, 200, 185]

const drawSectionHeader = (doc, text, y, pageW) => {
    doc.setFillColor(...SECTION_BG)
    doc.rect(14, y, pageW - 28, 7, 'F')
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...WHITE)
    doc.text(text, 17, y + 5)
    return y + 7
}

const drawHLine = (doc, y, pageW) => {
    doc.setDrawColor(...BORDER)
    doc.setLineWidth(0.3)
    doc.line(14, y, pageW - 14, y)
}

export const generateHealthReport = ({
    userName,
    userEmail,
    heartRisk,
    diabetesRisk,
    obesityRisk,
    inputs,
    generatedAt
}) => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()
    const date = new Date(generatedAt || Date.now()).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'long', year: 'numeric'
    })
    const reportNo = `VS-${Date.now().toString().slice(-6)}`

    // ── PAGE BACKGROUND ──
    doc.setFillColor(...LIGHT_BG)
    doc.rect(0, 0, pageW, pageH, 'F')

    // ── TOP WHITE CONTENT AREA ──
    doc.setFillColor(...WHITE)
    doc.rect(10, 10, pageW - 20, pageH - 20, 'F')

    // ── HEADER: LAB REPORT TITLE ──
    doc.setFontSize(13)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...DARK)
    doc.text('HEALTH', 16, 24)

    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...BROWN)
    doc.text('REPORT', 16, 33)

    // ── VS LOGO CIRCLE ──
    doc.setFillColor(...BROWN)
    doc.circle(pageW - 24, 22, 8, 'F')
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...WHITE)
    doc.text('VS', pageW - 24, 25, { align: 'center' })
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...BROWN)
    doc.text('VitalScan', pageW - 24, 31, { align: 'center' })

    // ── HEADER META FIELDS ──
    const metaX = 70
    const metaX2 = 140
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...DARK)

    doc.text('Report No', metaX, 17)
    doc.text('EXP. Title', metaX2, 17)
    drawHLine(doc, 18.5, pageW)

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 80)
    doc.text(reportNo, metaX, 22)
    doc.text('Lifestyle Health Risk Assessment', metaX2, 22)

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...DARK)
    doc.text('Name', metaX, 27)
    doc.text('Partner / Contact', metaX2, 27)
    drawHLine(doc, 28.5, pageW)

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 80)
    doc.text(userName || 'Not provided', metaX, 33)
    doc.text(userEmail || 'Not provided', metaX2, 33)

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...DARK)
    doc.text('Assessment Type', metaX, 38)
    doc.text('Date', metaX2, 38)
    drawHLine(doc, 39.5, pageW)

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 80)
    doc.text('AI-Powered Lifestyle Risk Detection', metaX, 44)
    doc.text(date, metaX2, 44)

    drawHLine(doc, 46, pageW)

    // ══════════════════════════════
    // SECTION 1 — ABSTRACT
    // ══════════════════════════════
    let y = 48
    y = drawSectionHeader(doc, 'ABSTRACT', y, pageW)
    y += 5

    const colW = (pageW - 28) / 3
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...DARK)
    doc.text('Purpose', 16, y)
    doc.text('Summary of Procedure', 16 + colW, y)
    doc.text('Key Findings', 16 + colW * 2, y)
    y += 2
    drawHLine(doc, y, pageW)
    y += 4

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(60, 60, 60)
    doc.setFontSize(7)

    const purposeLines = doc.splitTextToSize(
        'Detect early risk of heart disease, Type 2 diabetes, and obesity using non-clinical lifestyle inputs without lab tests.',
        colW - 4
    )
    const procedureLines = doc.splitTextToSize(
        'User submitted 17 lifestyle parameters. AI model processed inputs using Gradient Boosting trained on 8,000 synthetic records validated with WHO and ADA guidelines.',
        colW - 4
    )

    const heartLabel = getRiskLabel(heartRisk)
    const diabLabel = getRiskLabel(diabetesRisk)
    const obesLabel = getRiskLabel(obesityRisk)
    const findingsLines = doc.splitTextToSize(
        `Heart Risk: ${heartRisk.toFixed(1)}% (${heartLabel}). Diabetes Risk: ${diabetesRisk.toFixed(1)}% (${diabLabel}). Obesity Risk: ${obesityRisk.toFixed(1)}% (${obesLabel}).`,
        colW - 4
    )

    doc.text(purposeLines, 16, y)
    doc.text(procedureLines, 16 + colW, y)
    doc.text(findingsLines, 16 + colW * 2, y)
    y += Math.max(purposeLines.length, procedureLines.length, findingsLines.length) * 4 + 4

    drawHLine(doc, y, pageW)
    y += 6

    // ══════════════════════════════
    // SECTION 2 — RISK RESULTS
    // ══════════════════════════════
    y = drawSectionHeader(doc, 'RESULTS — RISK SCORES', y, pageW)
    y += 5

    const risks = [
        { label: 'Heart Disease', score: heartRisk, type: 'heart' },
        { label: 'Diabetes', score: diabetesRisk, type: 'diabetes' },
        { label: 'Obesity', score: obesityRisk, type: 'obesity' },
    ]

    const cardW = (pageW - 32) / 3

    risks.forEach((risk, i) => {
        const x = 14 + i * (cardW + 2)
        const color = getRiskColor(risk.score)
        const label = getRiskLabel(risk.score)

        doc.setFillColor(248, 245, 240)
        doc.roundedRect(x, y, cardW, 28, 2, 2, 'F')
        doc.setDrawColor(...BORDER)
        doc.setLineWidth(0.4)
        doc.roundedRect(x, y, cardW, 28, 2, 2, 'S')

        doc.setDrawColor(...color)
        doc.setLineWidth(1.2)
        doc.line(x, y, x, y + 28)

        doc.setFontSize(7)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...BROWN)
        doc.text(risk.label.toUpperCase(), x + cardW / 2, y + 6, { align: 'center' })

        doc.setFontSize(20)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...color)
        doc.text(`${risk.score.toFixed(1)}%`, x + cardW / 2, y + 18, { align: 'center' })

        doc.setFillColor(...color)
        doc.roundedRect(x + cardW / 2 - 10, y + 21, 20, 5, 1, 1, 'F')
        doc.setFontSize(6.5)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...WHITE)
        doc.text(label, x + cardW / 2, y + 24.5, { align: 'center' })
    })

    y += 33

    // ── Figure: Risk Bar Chart ──
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...DARK)
    doc.text('Figure: 1 — Risk Score Visualization', 16, y)
    y += 4

    risks.forEach((risk, i) => {
        const barY = y + i * 9
        const color = getRiskColor(risk.score)
        const barMaxW = pageW - 80

        doc.setFontSize(7)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...DARK)
        doc.text(risk.label, 16, barY + 4)

        doc.setFillColor(220, 215, 205)
        doc.roundedRect(55, barY, barMaxW, 5, 1, 1, 'F')

        const filledW = (risk.score / 100) * barMaxW
        doc.setFillColor(...color)
        doc.roundedRect(55, barY, filledW, 5, 1, 1, 'F')

        doc.setFontSize(7)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...color)
        doc.text(`${risk.score.toFixed(1)}%`, 55 + barMaxW + 3, barY + 4)
    })

    y += risks.length * 9 + 6
    drawHLine(doc, y, pageW)
    y += 6

    // ══════════════════════════════
    // SECTION 3 — KEY FACTORS
    // ══════════════════════════════
    y = drawSectionHeader(doc, 'KEY RISK FACTORS IDENTIFIED', y, pageW)
    y += 5

    const keyFactors = getKeyFactors(inputs)

    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...DARK)
    doc.text('Important Findings', 16, y)
    doc.text('Clinical Significance', 100, y)
    y += 2
    drawHLine(doc, y, pageW)
    y += 4

    keyFactors.forEach((factor, i) => {
        const parts = factor.split(' — ')
        doc.setFontSize(7)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...BROWN)
        doc.text(`${i + 1}.`, 16, y)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...DARK)
        const titleLines = doc.splitTextToSize(parts[0] || factor, 78)
        doc.text(titleLines, 21, y)
        if (parts[1]) {
            doc.setTextColor(80, 80, 80)
            const sigLines = doc.splitTextToSize(parts[1], pageW - 108)
            doc.text(sigLines, 100, y)
        }
        y += Math.max(titleLines.length, 1) * 4 + 2
    })

    y += 2
    drawHLine(doc, y, pageW)
    y += 6

    // ══════════════════════════════
    // SECTION 4 — MATERIALS (INPUTS)
    // ══════════════════════════════
    y = drawSectionHeader(doc, 'MATERIALS & METHODS — LIFESTYLE INPUTS RECORDED', y, pageW)
    y += 3

    if (inputs) {
        // Helper to map numeric enums back to labels
        const mapLvl = (val) => val === 2 ? 'High' : val === 1 ? 'Moderate' : 'Low'
        const mapSex = (val) => val === 1 || val === 'male' ? 'Male' : 'Female'
        const mapAct = (val) => val === 3 ? 'Active' : val === 2 ? 'Moderate' : val === 1 ? 'Light' : 'Sedentary'
        const mapSmk = (val) => val === 2 ? 'Current' : val === 1 ? 'Former' : 'Never'
        const mapBin = (val) => val === 1 ? 'Yes' : 'No'

        const inputRows = [
            ['Age', `${inputs.age ?? '-'} years`, 'Sex', mapSex(inputs.sex), 'Height', `${inputs.height_cm ?? '-'} cm`],
            ['Weight', `${inputs.weight_kg ?? '-'} kg`, 'BMI', inputs.obesity_bmi ? inputs.obesity_bmi.toFixed(1) : '-', 'Waist', `${inputs.waist_cm ?? '-'} cm`],
            ['Activity', mapAct(inputs.physical_activity_level), 'Sleep', `${inputs.sleep_hours ?? '-'} hrs`, 'Stress', mapLvl(inputs.stress_level)],
            ['Smoking', mapSmk(inputs.smoking_status), 'Diet Quality', 'Standard', 'Water Intake', `${inputs.water_intake_liters ?? '-'} L`],
            ['Junk Food', mapLvl(inputs.fried_food_consumption), 'Salt Intake', mapLvl(inputs.salt_intake_level), 'Sugar Intake', mapLvl(inputs.sugar_intake_level)],
            ['Chest Discomfort', mapLvl(inputs.chest_discomfort), 'Thirst Level', mapLvl(inputs.excessive_thirst_fatigue), 'Family Hx Heart', mapBin(inputs.family_history_heart)],
        ]


        autoTable(doc, {
            startY: y,
            body: inputRows,
            theme: 'grid',
            bodyStyles: {
                fontSize: 6.8,
                textColor: DARK,
                cellPadding: 2
            },
            columnStyles: {
                0: { fontStyle: 'bold', fillColor: [245, 240, 232], cellWidth: 28 },
                1: { cellWidth: 28 },
                2: { fontStyle: 'bold', fillColor: [245, 240, 232], cellWidth: 28 },
                3: { cellWidth: 28 },
                4: { fontStyle: 'bold', fillColor: [245, 240, 232], cellWidth: 28 },
                5: { cellWidth: 28 }
            },
            tableWidth: pageW - 28,
            margin: { left: 14 }
        })
        y = doc.lastAutoTable.finalY + 6
    }

    // ══════════════════════════════
    // SECTION 5 — RECOMMENDATIONS
    // ══════════════════════════════
    y = drawSectionHeader(doc, 'RECOMMENDATIONS & IMPROVEMENT SUGGESTIONS', y, pageW)
    y += 3

    autoTable(doc, {
        startY: y,
        head: [['Condition', 'Score', 'Risk Level', 'Recommended Action']],
        body: risks.map(r => [
            r.label,
            `${(r.score || 0).toFixed(1)}%`,
            getRiskLabel(r.score),
            getAdvice(r.type, r.score)
        ]),
        theme: 'grid',
        headStyles: {
            fillColor: BROWN,
            textColor: WHITE,
            fontStyle: 'bold',
            fontSize: 7.5
        },
        bodyStyles: {
            fontSize: 7,
            textColor: DARK,
            cellPadding: 2.5
        },
        columnStyles: {
            0: { cellWidth: 28 },
            1: { cellWidth: 16, halign: 'center' },
            2: { cellWidth: 20, halign: 'center' },
            3: { cellWidth: 'auto' }
        },
        didParseCell: (data) => {
            if (data.column.index === 2 && data.section === 'body') {
                const val = data.cell.raw
                if (val === 'HIGH') data.cell.styles.textColor = [180, 30, 30]
                else if (val === 'MODERATE') data.cell.styles.textColor = [160, 110, 0]
                else data.cell.styles.textColor = [30, 130, 60]
                data.cell.styles.fontStyle = 'bold'
            }
        },
        tableWidth: pageW - 28,
        margin: { left: 14 }
    })

    y = doc.lastAutoTable.finalY + 6

    // ══════════════════════════════
    // DISCLAIMER BOX
    // ══════════════════════════════
    if (y + 18 > pageH - 18) {
        doc.addPage()
        doc.setFillColor(...LIGHT_BG)
        doc.rect(0, 0, pageW, pageH, 'F')
        doc.setFillColor(...WHITE)
        doc.rect(10, 10, pageW - 20, pageH - 20, 'F')
        y = 20
    }

    doc.setFillColor(255, 248, 220)
    doc.roundedRect(14, y, pageW - 28, 16, 2, 2, 'F')
    doc.setDrawColor(200, 160, 0)
    doc.setLineWidth(0.4)
    doc.roundedRect(14, y, pageW - 28, 16, 2, 2, 'S')
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(120, 80, 0)
    doc.text('⚠  DISCLAIMER', 18, y + 5.5)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.text('This report is generated from lifestyle inputs only and is NOT a substitute for clinical diagnosis or medical advice.', 18, y + 10)
    doc.text('Please consult a qualified medical professional for proper evaluation. VitalScan is an educational awareness tool only.', 18, y + 14)

    // ══════════════════════════════
    // FOOTER
    // ══════════════════════════════
    doc.setFillColor(...BROWN)
    doc.rect(10, pageH - 14, pageW - 20, 10, 'F')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...WHITE)
    doc.text('VitalScan — AI Health Risk Detection Platform', 16, pageH - 8)
    doc.setFont('helvetica', 'normal')
    doc.text(`Report ID: ${reportNo}  |  Generated: ${date}  |  Not for clinical use`, pageW - 16, pageH - 8, { align: 'right' })

    // ── SAVE ──
    const fileName = `VitalScan_HealthReport_${(userName || 'User').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`
    doc.save(fileName)
}
