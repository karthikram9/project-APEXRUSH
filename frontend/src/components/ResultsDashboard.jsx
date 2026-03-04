import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { submitPrediction } from '../api';
import { Activity, Apple, Dumbbell } from 'lucide-react';
import { STYLES } from '../utils/styles';

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
    const [results, setResults] = useState(location.state?.results || null);

    // Debounced simulation effect
    useEffect(() => {
        const timer = setTimeout(async () => {
            try {
                const floatData = {};
                for (const key in simData) floatData[key] = parseFloat(simData[key]) || 0.0;

                const newResults = await submitPrediction(floatData);
                setResults(newResults);
            } catch (err) {
                console.error("Simulation error:", err);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [simData]);

    const handleSliderChange = (e) => {
        setSimData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    if (!results) return <div className="text-center py-20">Loading Results...</div>;

    const riskAssessment = results.obesity_assessment || { bmi_category: "Unknown", whr_risk: "Unknown" };

    return (
        <div className="max-w-6xl mx-auto w-full px-4 pt-12 pb-24">
            <h1 className="text-3xl font-bold mb-8 items-center flex gap-3 text-white">
                Risk Analysis
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <Gauge
                    title="Heart Disease"
                    score={results.heart_risk_percent}
                    icon={Activity}
                    factors={["Blood Pressure Trends", "Age Bracketing", "BMI Ratio"]}
                />
                <Gauge
                    title="Diabetes"
                    score={results.diabetes_risk_percent}
                    icon={Apple}
                    factors={["Sugar Intake", "Family History", "Physical Activity"]}
                />
                <Gauge
                    title="Obesity Context"
                    score={
                        riskAssessment.whr_risk === "High" ? 85 :
                            riskAssessment.bmi_category.includes("Obesity") ? 75 :
                                30
                    }
                    icon={Dumbbell}
                    factors={[`BMI: ${riskAssessment.bmi_category}`, `WHR Risk: ${riskAssessment.whr_risk}`]}
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
                        { name: 'physical_activity', label: 'Activity Level', min: 0, max: 3, step: 1 },
                        { name: 'sleep_hours', label: 'Sleep Hours', min: 3, max: 12, step: 0.5 },
                        { name: 'stress_level', label: 'Stress Level', min: 0, max: 3, step: 1 },
                        { name: 'smoking_status', label: 'Smoking Status', min: 0, max: 2, step: 1 },
                        { name: 'sugar_intake', label: 'Sugar Intake', min: 0, max: 2, step: 1 },
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

            <button
                onClick={() => navigate('/diet', { state: { results } })}
                className={STYLES.buttonSubmit}
            >
                Generate Diet Plan
            </button>

            <p className="text-center text-gray-500 text-sm mt-12 mb-4">
                * Educational only. Not a medical diagnosis. Consult a doctor.
            </p>
        </div>
    );
};

export default ResultsDashboard;
