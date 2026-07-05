import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { predictRisk, sendFamilyAlerts } from '../api';
import { Activity, Apple, Dumbbell, Download } from 'lucide-react';
import { STYLES } from '../utils/styles';
import { collection, getDocs } from 'firebase/firestore'
import { firebaseDB } from '../firebase'
import { getAuth } from 'firebase/auth'
import { sendAlertEmails } from '../utils/emailService'
import { generateHealthReport } from '../utils/reportGenerator'

const getRiskColor = (score) => {
    if (score < 40) return '#10b981'; // green-500
    if (score < 70) return '#eab308'; // yellow-500
    return '#ef4444'; // red-500
};

const Gauge = ({ title, score, icon: Icon, factors }) => (
    <div className="glass-panel p-6 flex flex-col items-center relative overflow-hidden group">
        <div className="absolute top-4 left-4 p-3 bg-white/5 rounded-2xl">
            <Icon size={24} className="text-white/70 group-hover:text-white transition-colors" />
        </div>
        <h3 className="text-lg font-medium text-gray-300 mb-6">{title}</h3>

        <RadialBarChart
            width={200}
            height={200}
            cx={100}
            cy={100}
            innerRadius={60}
            outerRadius={80}
            barSize={15}
            data={[{ value: score, fill: getRiskColor(score) }]}
            startAngle={180}
            endAngle={0}
        >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar background={{ fill: 'rgba(255,255,255,0.05)' }} dataKey="value" cornerRadius={10} />
            <text x={100} y={100} textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold fill-white">
                {Math.round(score)}%
            </text>
        </RadialBarChart>

        <div className="w-full mt-4 flex flex-col gap-2">
            <p className="text-sm text-gray-400 font-medium mb-1">Key Factors:</p>
            {factors.map((f, i) => (
                <div key={i} className="flex items-center text-sm text-gray-300 bg-white/5 px-3 py-1.5 rounded-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/30 mr-2"></span>
                    {f}
                </div>
            ))}
        </div>
    </div>
);

const ResultsDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [simData, setSimData] = useState(location.state?.originalData || {});

    // Read results from location.state or sessionStorage
    const [results, setResults] = useState(() => {
        return location.state?.results ||
            JSON.parse(sessionStorage.getItem('vitalResults') || '{}')
    });

    // Log results when they change
    useEffect(() => {
        if (results && Object.keys(results).length > 0) {
            console.log("Results updated:", results);
            const heartRisk = results.heart_risk_percent || 0;
            const diabetesRisk = results.diabetes_risk_percent || 0;
            const obesityRisk = results.obesity_risk_percent || 0;
            console.log("Heart Risk:", heartRisk);
            console.log("Diabetes Risk:", diabetesRisk);
            console.log("Obesity Risk:", obesityRisk);
            triggerAlertEmails(heartRisk, diabetesRisk, obesityRisk);
        }
    }, [results]);

    // Debounced simulation effect — only runs when simData has real form data
    useEffect(() => {
        // If simData is empty (direct page load / refresh), skip the API call
        if (!simData || Object.keys(simData).length === 0) return;

        const timer = setTimeout(async () => {
            try {
                // Use the original data and override with current slider values
                const simulatedData = { ...simData };

                // Ensure all numeric fields are proper numbers (not NaN/null)
                for (const key in simulatedData) {
                    const parsed = parseFloat(simulatedData[key]);
                    simulatedData[key] = isNaN(parsed) ? 0 : parsed;
                }

                console.log("Submitting simulation data:", simulatedData);
                const newResults = await predictRisk(simulatedData);
                console.log("Simulation results:", newResults);
                setResults(newResults);
                triggerFamilyAlerts(
                    newResults.heart_risk_percent,
                    newResults.diabetes_risk_percent,
                    newResults.obesity_risk_percent
                );
                triggerAlertEmails(
                    newResults.heart_risk_percent,
                    newResults.diabetes_risk_percent,
                    newResults.obesity_risk_percent
                );
            } catch (err) {
                console.error("Simulation error:", err);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [simData]);

    const handleSliderChange = (e) => {
        setSimData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDownloadReport = () => {
        try {
            console.log("Starting report generation...");
            const auth = getAuth();
            const user = auth.currentUser;

            // Ensure we have scores, fallback to 0
            const heart = results?.heart_risk_percent ?? 0;
            const diabetes = results?.diabetes_risk_percent ?? 0;
            const obesity = results?.obesity_risk_percent ?? 0;

            // Use current simData for inputs as it's the most up-to-date
            const inputsData = simData && Object.keys(simData).length > 0 ? simData : (location.state?.originalData || {});

            generateHealthReport({
                userName: user?.displayName || user?.email || 'VitalScan User',
                userEmail: user?.email || 'Not provided',
                heartRisk: heart,
                diabetesRisk: diabetes,
                obesityRisk: obesity,
                inputs: inputsData,
                generatedAt: new Date().toISOString(),
            });
            console.log("Report generation call completed.");
        } catch (err) {
            console.error("PDF Generate Error:", err);
            alert("Failed to generate report: " + err.message);
        }
    };

    const triggerFamilyAlerts = async (heartRisk, diabetesRisk, obesityRisk) => {
        try {
            const auth = getAuth()
            const user = auth.currentUser
            if (!user) return

            const snap = await getDocs(
                collection(firebaseDB, 'users', user.uid, 'familyAlerts')
            )
            const emails = snap.docs.map(d => d.data().email).filter(Boolean)
            if (emails.length === 0) return

            const userName = user.displayName || user.email

            const result = await sendFamilyAlerts(
                userName,
                emails,
                heartRisk,
                diabetesRisk,
                obesityRisk
            )

            if (result.sent) {
                console.log('Family alerts sent to:', result.sent_to)
            } else {
                console.log('No alert sent:', result.reason)
            }
        } catch (e) {
            console.error('Alert trigger error:', e)
        }
    }

    const triggerAlertEmails = async (heartRisk, diabetesRisk, obesityRisk) => {
        try {
            const auth = getAuth()
            const user = auth.currentUser
            if (!user) return

            const userName = user.displayName || 'VitalScan User'
            const userEmail = user.email

            // Load family contacts from Firestore
            const snap = await getDocs(
                collection(firebaseDB, 'users', user.uid, 'familyAlerts')
            )
            const familyContacts = snap.docs.map(d => ({
                name: d.data().name,
                email: d.data().email
            })).filter(c => c.email)

            const result = await sendAlertEmails(
                userName,
                userEmail,
                familyContacts,
                heartRisk,
                diabetesRisk,
                obesityRisk
            )

            if (result.sent) {
                console.log('Emails sent:', result.results)
            } else {
                console.log('No emails sent:', result.reason)
            }
        } catch (e) {
            console.error('Alert trigger error:', e)
        }
    }

    if (!results || !results.heart_risk_percent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950">
                <div className="text-center">
                    <p className="text-gray-400 mb-4">Loading results...</p>
                    <button
                        onClick={() => navigate('/form')}
                        className="text-emerald-400 hover:text-emerald-300"
                    >
                        Back to Form
                    </button>
                </div>
            </div>
        );
    }

    // Extract field values with correct names
    const heartRisk = results.heart_risk_percent || 0;
    const diabetesRisk = results.diabetes_risk_percent || 0;
    const obesityScore = results.obesity_risk_percent || 0;
    const obesityCategory = results.obesity_risk_category || "Unknown";
    const bmiCategory = results.obesity_bmi_category || "Unknown";
    const whtrCategory = results.obesity_whtr_category || "Unknown";

    const heartFactors = results.heart_top_factors?.map(f => f.label) || ["Blood Pressure Trends", "Age Bracketing", "BMI Ratio"];
    const diabetesFactors = results.diabetes_top_factors?.map(f => f.label) || ["Sugar Intake", "Family History", "Physical Activity"];
    const obesityFactors = results.obesity_top_factors?.map(f => f.label) || [`BMI: ${bmiCategory}`, `WHtR: ${whtrCategory}`];

    return (
        <div className="max-w-6xl mx-auto w-full px-4 pt-12 pb-24">
            <h1 className="text-3xl font-bold mb-8 items-center flex gap-3 text-white">
                Risk Analysis
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <Gauge
                    title="Heart Disease"
                    score={heartRisk}
                    icon={Activity}
                    factors={heartFactors}
                />
                <Gauge
                    title="Diabetes"
                    score={diabetesRisk}
                    icon={Apple}
                    factors={diabetesFactors}
                />
                <Gauge
                    title="Obesity Context"
                    score={obesityScore}
                    icon={Dumbbell}
                    factors={obesityFactors}
                />
            </div>

            <div className="glass-panel p-8 mb-12">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                    Simulation Testing
                </h3>
                <p className="text-gray-400 mb-6 text-sm">Adjust behavior to see real-time impact on risk</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        { name: 'physical_activity_level', label: 'Activity Level', min: 0, max: 3, step: 1 },
                        { name: 'sleep_hours', label: 'Sleep Hours', min: 3, max: 12, step: 0.5 },
                        { name: 'stress_level', label: 'Stress Level', min: 0, max: 3, step: 1 },
                        { name: 'smoking_status', label: 'Smoking Status', min: 0, max: 2, step: 1 },
                        { name: 'sugar_intake_level', label: 'Sugar Intake', min: 0, max: 2, step: 1 },
                    ].map(field => (
                        <div key={field.name}>
                            <div className="flex justify-between text-sm mb-2 text-gray-300">
                                <span>{field.label}</span>
                                <span>{simData[field.name]}</span>
                            </div>
                            <input
                                type="range"
                                name={field.name}
                                min={field.min}
                                max={field.max}
                                step={field.step}
                                value={simData[field.name]}
                                onChange={handleSliderChange}
                                className="w-full accent-emerald-500 bg-white/10 rounded-lg appearance-none h-2"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button
                    onClick={() => navigate('/diet', { state: { results } })}
                    className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] text-lg"
                >
                    Generate Diet Plan
                </button>

                <button
                    onClick={handleDownloadReport}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-emerald-500/50 text-white rounded-xl font-semibold transition-all active:scale-[0.98] text-lg"
                >
                    <Download size={20} />
                    Download Lab Report
                </button>
            </div>

            <p className="text-center text-gray-500 text-sm mt-12 mb-4">
                * Educational only. Not a medical diagnosis. Consult a doctor.
            </p>
        </div>
    );
};

export default ResultsDashboard;