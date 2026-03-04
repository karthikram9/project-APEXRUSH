import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
        ),
        title: 'Early Detection',
        desc: 'Identify chronic disease risks years before symptoms appear — giving you time to act.',
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" ry="1" />
                <path d="M9 12h6M9 16h4" />
            </svg>
        ),
        title: 'No Lab Tests',
        desc: 'Answer a few lifestyle questions. No blood tests, no clinics, no waiting rooms.',
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
                <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
        ),
        title: 'Personalized Action Plan',
        desc: 'Get a custom diet & lifestyle plan tailored to your risk profile — instantly.',
    },
];

const STATS = [
    { value: '1 in 4', label: 'Indians under 45 are at silent chronic disease risk' },
    { value: '3 min', label: 'Is all it takes to know your risk score' },
    { value: '3', label: 'Diseases screened: Heart Disease, Diabetes & Obesity' },
];

export default function LandingPage() {
    const navigate = useNavigate();
    const heroRef = useRef(null);

    // Subtle parallax on hero
    useEffect(() => {
        const handleScroll = () => {
            if (heroRef.current) {
                heroRef.current.style.transform = `translateY(${window.scrollY * 0.25}px)`;
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleCTA = () => navigate('/auth');

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">

            {/* ── NAV ── */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4
                      bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
                <div className="flex items-center gap-2">
                    <HeartPulseIcon />
                    <span className="text-xl font-bold tracking-tight">
                        Vital<span className="text-emerald-400">Scan</span>
                    </span>
                </div>
                <button
                    onClick={handleCTA}
                    className="px-5 py-2 text-sm font-semibold rounded-full bg-emerald-500 hover:bg-emerald-400
                     text-black transition-all duration-200 hover:scale-105 shadow-lg shadow-emerald-500/20"
                >
                    Get Started
                </button>
            </nav>

            {/* ── HERO ── */}
            <section className="relative min-h-screen flex flex-col items-center justify-center text-center
                          px-6 pt-24 pb-16 overflow-hidden">
                {/* Animated background blobs */}
                <div className="absolute inset-0 pointer-events-none">
                    <div ref={heroRef} className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2
                                        w-[600px] h-[600px] rounded-full
                                        bg-emerald-500/10 blur-[120px]" />
                    <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full
                          bg-teal-400/5 blur-[80px]" />
                    <div className="absolute top-0 left-0 w-48 h-48 rounded-full
                          bg-emerald-600/5 blur-[60px]" />
                </div>

                {/* Floating badge */}
                <span className="relative inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full text-xs font-semibold
                         bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 tracking-wider uppercase
                         animate-pulse-slow">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping-slow" />
                    AI-Powered Health Risk Assessment
                </span>

                {/* Logo mark */}
                <div className="relative mb-6">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600
                          flex items-center justify-center shadow-2xl shadow-emerald-500/30
                          animate-float">
                        <HeartPulseIcon size={40} />
                    </div>
                </div>

                <h1 className="relative text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight mb-6 max-w-4xl
                       bg-gradient-to-br from-white via-white/90 to-white/50 bg-clip-text text-transparent">
                    Know Your Risk<br />
                    <span className="text-emerald-400">Before It Knows You</span>
                </h1>

                <p className="relative text-lg sm:text-xl text-white/60 max-w-2xl mb-10 leading-relaxed">
                    Early detection of{' '}
                    <span className="text-white/90 font-medium">Heart Disease</span>,{' '}
                    <span className="text-white/90 font-medium">Diabetes</span> &{' '}
                    <span className="text-white/90 font-medium">Obesity</span> risk using your lifestyle
                    habits — <em>no lab tests needed.</em>
                </p>

                <div className="relative flex flex-col sm:flex-row gap-4 items-center">
                    <button
                        onClick={handleCTA}
                        className="group px-8 py-4 text-lg font-bold rounded-2xl
                       bg-gradient-to-r from-emerald-500 to-teal-500
                       text-black hover:from-emerald-400 hover:to-teal-400
                       transition-all duration-300 hover:scale-105 hover:-translate-y-1
                       shadow-xl shadow-emerald-500/30"
                    >
                        Check Your Risk Now
                        <span className="ml-2 inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
                    </button>
                    <span className="text-white/40 text-sm">Free · Takes only 3 minutes · No signup fees</span>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1
                        text-white/30 text-xs animate-bounce">
                    <span>Scroll</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </section>

            {/* ── HEALTH AWARENESS BANNER ── */}
            <section className="relative py-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 via-teal-600/10 to-emerald-600/20" />
                <div className="absolute inset-0 border-y border-emerald-500/20" />
                <div className="relative max-w-4xl mx-auto px-6 text-center">
                    <p className="text-2xl sm:text-3xl font-bold text-white/90">
                        "Your lifestyle today decides your health tomorrow."
                    </p>
                    <p className="mt-3 text-white/50 text-base">
                        VitalScan was built for the 250M+ Indians who are unaware of their silent health risks.
                    </p>
                </div>
            </section>

            {/* ── STATS ── */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <p className="text-center text-white/40 text-sm uppercase tracking-widest font-semibold mb-12">
                        The Reality Check
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {STATS.map((s) => (
                            <div key={s.value}
                                className="group relative p-8 rounded-2xl bg-white/[0.03] border border-white/[0.07]
                              hover:border-emerald-500/30 hover:bg-emerald-500/5
                              transition-all duration-300 text-center">
                                <div className="text-4xl sm:text-5xl font-extrabold text-emerald-400 mb-3
                                group-hover:scale-105 transition-transform duration-300">
                                    {s.value}
                                </div>
                                <div className="text-white/60 text-sm leading-relaxed">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FEATURE CARDS ── */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-center text-3xl sm:text-4xl font-bold mb-4">
                        Why <span className="text-emerald-400">VitalScan</span>?
                    </h2>
                    <p className="text-center text-white/50 mb-14 max-w-xl mx-auto">
                        Most people discover chronic disease when it's already advanced.
                        We give you the early warning signal.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {FEATURES.map((f, i) => (
                            <div key={i}
                                className="group relative p-8 rounded-2xl bg-white/[0.03] border border-white/[0.07]
                              hover:border-emerald-500/40 hover:bg-emerald-500/5
                              transition-all duration-500 hover:-translate-y-2">
                                {/* Glow on hover */}
                                <div className="absolute inset-0 rounded-2xl bg-emerald-500/0 group-hover:bg-emerald-500/5
                                transition-all duration-500" />
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20
                                  flex items-center justify-center text-emerald-400 mb-6
                                  group-hover:bg-emerald-500/20 transition-colors duration-300">
                                        {f.icon}
                                    </div>
                                    <h3 className="text-lg font-bold mb-3 text-white group-hover:text-emerald-300
                                 transition-colors duration-300">{f.title}</h3>
                                    <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section className="py-20 px-6 bg-white/[0.015]">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                        How It <span className="text-emerald-400">Works</span>
                    </h2>
                    <p className="text-white/50 mb-14">Three steps to your full health risk report.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                        {[
                            { step: '01', title: 'Answer Questions', desc: 'Share your age, lifestyle, diet & activity habits — no blood tests.' },
                            { step: '02', title: 'AI Analysis', desc: 'Our ML model analyses 20+ risk factors across 3 disease categories.' },
                            { step: '03', title: 'Get Your Plan', desc: 'Receive your personalised risk score + actionable diet and lifestyle plan.' },
                        ].map((item) => (
                            <div key={item.step} className="flex flex-col items-center">
                                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30
                                flex items-center justify-center text-emerald-400 font-extrabold text-xl mb-4">
                                    {item.step}
                                </div>
                                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FINAL CTA ── */}
            <section className="py-24 px-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                          w-[500px] h-[300px] rounded-full bg-emerald-500/10 blur-[100px]" />
                </div>
                <div className="relative max-w-2xl mx-auto">
                    <h2 className="text-4xl sm:text-5xl font-extrabold mb-6">
                        Your health can't wait.<br />
                        <span className="text-emerald-400">Start now — it's free.</span>
                    </h2>
                    <p className="text-white/50 mb-10 text-lg">
                        It takes 3 minutes. No lab tests. No credit card.
                    </p>
                    <button
                        onClick={handleCTA}
                        className="group px-10 py-4 text-xl font-bold rounded-2xl
                       bg-gradient-to-r from-emerald-500 to-teal-500
                       text-black hover:from-emerald-400 hover:to-teal-400
                       transition-all duration-300 hover:scale-105 hover:-translate-y-1
                       shadow-2xl shadow-emerald-500/40"
                    >
                        Check Your Risk Now
                        <span className="ml-2 inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
                    </button>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="py-8 px-6 border-t border-white/5 text-center text-white/30 text-sm">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <HeartPulseIcon size={16} />
                    <span>VitalScan — Built for India's Health Hackathon 2026</span>
                </div>
                <p>For awareness purposes only. Not a medical diagnosis.</p>
            </footer>

            <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes ping-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.5); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-ping-slow { animation: ping-slow 2s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse 3s ease-in-out infinite; }
      `}</style>
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
