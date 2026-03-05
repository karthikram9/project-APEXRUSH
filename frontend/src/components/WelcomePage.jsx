import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function WelcomePage({ user }) {
    const navigate = useNavigate();
    
    const firstName = user?.displayName 
        ? user.displayName.split(' ')[0] 
        : 'Friend';

    // Mark welcome as seen
    useEffect(() => {
        if (user?.uid) {
            localStorage.setItem(
                `hasSeenWelcome_${user.uid}`, 
                'true'
            );
        }
    }, [user?.uid]);

    const handleStartAssessment = () => {
        navigate('/form');
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
            {/* Background gradient glow at top center */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px]
                          rounded-full bg-gradient-to-b from-emerald-500/15 to-transparent blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full
                          bg-teal-400/5 blur-[80px] pointer-events-none" />

            <div className="relative z-10 max-w-2xl w-full">
                {/* Logo section */}
                <div className="flex justify-center mb-12">
                    <div className="bg-white/[0.03] border border-white/[0.09] rounded-2xl p-4 backdrop-blur-xl">
                        <div className="w-16 h-16 rounded-xl bg-emerald-500/20 border border-emerald-500/30
                                    flex items-center justify-center mx-auto">
                            <HeartPulseIcon size={28} />
                        </div>
                        <div className="text-center mt-3 text-sm font-semibold">
                            Vital<span className="text-emerald-400">Scan</span>
                        </div>
                    </div>
                </div>

                {/* Personalized greeting */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl md:text-6xl font-bold mb-2 leading-tight">
                        Welcome to VitalScan, <span className="text-emerald-400">{firstName}</span> 👋
                    </h1>
                </div>

                {/* Mission statement card */}
                <div className="bg-white/[0.03] border border-emerald-500/20 rounded-2xl p-8 mb-10
                            backdrop-blur-xl shadow-2xl">
                    <p className="text-lg text-white/90 leading-relaxed text-center">
                        <span className="font-semibold text-emerald-400">Your health journey starts here.</span>
                        {' '}VitalScan uses AI to detect early risk of Heart Disease, Type 2 Diabetes, and Obesity — before symptoms appear.
                    </p>
                    <p className="text-white/80 mt-4 text-center">
                        No lab tests. No doctor visit. <br />
                        <span className="font-semibold text-emerald-400">Just honest insights from your daily habits.</span>
                    </p>
                </div>

                {/* Three feature cards */}
                <div className="grid md:grid-cols-3 gap-4 mb-10">
                    {/* Card 1 */}
                    <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-6 hover:border-emerald-500/30 hover:bg-white/[0.05] transition-all duration-300">
                        <div className="text-3xl mb-3">🫀</div>
                        <h3 className="font-bold text-white mb-2">Heart Risk Detection</h3>
                        <p className="text-white/70 text-sm">
                            AI-powered early warning for cardiovascular risk factors
                        </p>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-6 hover:border-emerald-500/30 hover:bg-white/[0.05] transition-all duration-300">
                        <div className="text-3xl mb-3">🩸</div>
                        <h3 className="font-bold text-white mb-2">Diabetes Risk Analysis</h3>
                        <p className="text-white/70 text-sm">
                            Identify lifestyle-driven diabetes risk before it develops
                        </p>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-6 hover:border-emerald-500/30 hover:bg-white/[0.05] transition-all duration-300">
                        <div className="text-3xl mb-3">⚖️</div>
                        <h3 className="font-bold text-white mb-2">Obesity Risk Assessment</h3>
                        <p className="text-white/70 text-sm">
                            WHO-validated BMI and body composition analysis
                        </p>
                    </div>
                </div>

                {/* Health awareness message */}
                <div className="text-center mb-10 px-4">
                    <p className="text-white/60 italic text-base leading-relaxed">
                        <span className="text-emerald-400 font-semibold">Did you know?</span> 1 in 3 Indians under 45 is at risk of a lifestyle disease without knowing it. 
                        Early awareness saves lives — and yours starts today.
                    </p>
                </div>

                {/* CTA Button */}
                <div className="flex flex-col items-center gap-4 mb-8">
                    <button
                        onClick={handleStartAssessment}
                        className="px-8 py-4 rounded-xl font-bold text-lg text-black
                                   bg-gradient-to-r from-emerald-500 to-teal-500
                                   hover:from-emerald-400 hover:to-teal-400
                                   disabled:opacity-60 disabled:cursor-not-allowed
                                   transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5
                                   shadow-lg shadow-emerald-500/30"
                    >
                        Start My Health Assessment →
                    </button>
                    <p className="text-white/50 text-sm">
                        Takes 3 minutes · Free · No signup fees
                    </p>
                </div>

                {/* Bottom disclaimer */}
                <div className="text-center border-t border-white/[0.08] pt-6">
                    <p className="text-white/40 text-xs leading-relaxed">
                        * Educational tool only. Not a medical diagnosis. Consult a doctor for clinical evaluation.
                    </p>
                </div>
            </div>
        </div>
    );
}

function HeartPulseIcon({ size = 24 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="text-emerald-400">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            <path d="M3.22 12H9.5l1.5-3 2 6 1.5-3H21" />
        </svg>
    );
}
