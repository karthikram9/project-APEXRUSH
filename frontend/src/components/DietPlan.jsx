import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { submitDietPlan } from '../api';
import { STYLES } from '../utils/styles';
import { CheckCircle, AlertTriangle, Lightbulb, Compass } from 'lucide-react';

const MEDICATION_TYPES = [
    { id: 'blood_thinners', label: 'Blood Thinners' },
    { id: 'diabetes_medication', label: 'Diabetes Medication' },
    { id: 'bp_medication', label: 'BP Medication' },
    { id: 'cholesterol_medication', label: 'Cholesterol Medication' },
    { id: 'none', label: 'None' }
];

const DietPlan = () => {
    const location = useLocation();
    const results = location.state?.results;

    const [showModal, setShowModal] = useState(true);
    const [medications, setMedications] = useState([]);
    const [dietPlan, setDietPlan] = useState(null);
    const [loading, setLoading] = useState(false);

    const toggleMedication = (id) => {
        if (id === 'none') {
            setMedications(['none']);
            return;
        }

        setMedications(prev => {
            const noNone = prev.filter(m => m !== 'none');
            if (noNone.includes(id)) {
                return noNone.filter(m => m !== id);
            }
            return [...noNone, id];
        });
    };

    const handleGenerate = async () => {
        if (medications.length === 0) return alert("Please select at least one option.");

        setLoading(true);
        setShowModal(false);
        try {
            // Format Obesity to flat score roughly for logic bridging if required:
            // Since diet.py requires floats for logic mapping > 60:
            let obs_score = 0;
            if (results?.obesity_assessment) {
                if (results.obesity_assessment.whr_risk === "High") obs_score = 80;
                else if (results.obesity_assessment.bmi_category.includes("Obesity")) obs_score = 70;
            }

            const dietResults = await submitDietPlan({
                heart_risk: results?.heart_risk_percent || 0,
                diabetes_risk: results?.diabetes_risk_percent || 0,
                obesity_risk: obs_score,
                medications: medications.includes('none') ? [] : medications
            });
            setDietPlan(dietResults);
        } catch (error) {
            console.error(error);
            alert("Failed to generate diet plan.");
            setShowModal(true);
        } finally {
            setLoading(false);
        }
    };

    if (!results) return <div className="text-center py-20 text-white">Results not found. Please complete the form.</div>;

    const listRenderer = (items) => {
        if (!items || items.length === 0) return <p className="text-sm text-gray-400">None detected based on parameters.</p>;
        return (
            <ul className="space-y-2 mt-4">
                {items.map((item, i) => (
                    <li key={i} className="flex items-start text-gray-300 text-sm bg-white/5 py-2 px-3 rounded-lg border border-white/5">
                        <span className="mr-3 mt-1 w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0"></span>
                        {item}
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <div className="max-w-5xl mx-auto w-full px-4 pt-12 pb-24 relative">
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass-panel p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-emerald-500/20 flex flex-center items-center justify-center">💊</span>
                            Medical Context
                        </h2>
                        <p className="text-gray-300 mb-6 text-sm">Are you currently on any of the following medications? This helps map interactions.</p>

                        <div className="space-y-3 mb-8">
                            {MEDICATION_TYPES.map(med => (
                                <label key={med.id} className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${medications.includes(med.id) ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 hover:bg-white/5'}`}>
                                    <input
                                        type="checkbox"
                                        checked={medications.includes(med.id)}
                                        onChange={() => toggleMedication(med.id)}
                                        className="hidden"
                                    />
                                    <span className={`w-5 h-5 rounded border mr-3 flex items-center justify-center ${medications.includes(med.id) ? 'bg-emerald-500 border-emerald-500' : 'border-gray-500'}`}>
                                        {medications.includes(med.id) && <CheckCircle size={14} className="text-white" />}
                                    </span>
                                    <span className="text-gray-200">{med.label}</span>
                                </label>
                            ))}
                        </div>
                        <button onClick={handleGenerate} className={STYLES.buttonSubmit + " mt-0"}>
                            Finalize Plan
                        </button>
                    </div>
                </div>
            )}

            {loading && <div className="text-center py-20 text-emerald-400 animate-pulse">Generating your tailored diet parameters...</div>}

            {dietPlan && !showModal && (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200 mb-3">
                            Your Tailored Protocol
                        </h1>
                        <p className="text-gray-400">Generated utilizing your predicted metabolic risk factors and medicinal interactions.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-panel p-6 border-t-2 border-t-emerald-500">
                            <h3 className="text-xl font-bold flex items-center gap-3 mb-2 text-emerald-400">
                                <CheckCircle size={22} /> Foods to Prioritize
                            </h3>
                            {listRenderer(dietPlan.foods_to_eat)}
                        </div>

                        <div className="glass-panel p-6 border-t-2 border-t-red-500">
                            <h3 className="text-xl font-bold flex items-center gap-3 mb-2 text-red-400">
                                <AlertTriangle size={22} /> Critical Avoidances
                            </h3>
                            {listRenderer(dietPlan.foods_to_avoid)}
                        </div>

                        <div className="glass-panel p-6 border-t-2 border-t-blue-500">
                            <h3 className="text-xl font-bold flex items-center gap-3 mb-2 text-blue-400">
                                <Compass size={22} /> Top Priority Actions
                            </h3>
                            {listRenderer(dietPlan.priority_actions)}
                        </div>

                        <div className="glass-panel p-6 border-t-2 border-t-purple-500">
                            <h3 className="text-xl font-bold flex items-center gap-3 mb-2 text-purple-400">
                                <Lightbulb size={22} /> Lifestyle Edits
                            </h3>
                            {listRenderer(dietPlan.lifestyle_tips)}
                        </div>
                    </div>
                </div>
            )}

            <p className="text-center text-gray-500 text-sm mt-12 mb-4">
                * Educational only. Not a medical diagnosis. Consult a doctor.
            </p>
        </div>
    );
};

export default DietPlan;
