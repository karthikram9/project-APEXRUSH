import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* ── Auth helpers (localStorage-based, no backend needed) ── */
const getUsers = () => JSON.parse(localStorage.getItem('vs_users') || '[]');
const saveUsers = (users) => localStorage.setItem('vs_users', JSON.stringify(users));
const setSession = (user) => localStorage.setItem('vs_session', JSON.stringify(user));

/* ── Reusable input component ── */
function Field({ id, label, type = 'text', value, onChange, placeholder, error }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={id} className="text-sm font-medium text-white/70">{label}</label>
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete="off"
                className={`w-full px-4 py-3 rounded-xl bg-white/[0.06] border text-white placeholder-white/30
                    outline-none transition-all duration-200
                    focus:bg-white/[0.08] focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/20
                    ${error ? 'border-red-500/60' : 'border-white/[0.12]'}`}
            />
            {error && <p className="text-xs text-red-400 mt-0.5">{error}</p>}
        </div>
    );
}

/* ── Sign Up Form ── */
function SignUpForm({ onSuccess }) {
    const [form, setForm] = useState({ name: '', age: '', email: '', password: '', confirm: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Full name is required.';
        const age = parseInt(form.age);
        if (!form.age || isNaN(age) || age < 10 || age > 120) errs.age = 'Enter a valid age (10–120).';
        if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = 'Enter a valid email.';
        if (form.password.length < 6) errs.password = 'Password must be at least 6 characters.';
        if (form.password !== form.confirm) errs.confirm = 'Passwords do not match.';
        return errs;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setLoading(true);
        setTimeout(() => {
            const users = getUsers();
            if (users.find((u) => u.email === form.email)) {
                setErrors({ email: 'Account already exists. Please log in.' });
                setLoading(false);
                return;
            }
            const newUser = { name: form.name, age: parseInt(form.age), email: form.email, password: form.password };
            saveUsers([...users, newUser]);
            setSession({ name: newUser.name, email: newUser.email, age: newUser.age });
            setLoading(false);
            onSuccess();
        }, 600);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Field id="su-name" label="Full Name" value={form.name} onChange={set('name')} placeholder="Arjun Sharma" error={errors.name} />
            <Field id="su-age" label="Age" type="number" value={form.age} onChange={set('age')} placeholder="25" error={errors.age} />
            <Field id="su-email" label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" error={errors.email} />
            <Field id="su-pass" label="Password" type="password" value={form.password} onChange={set('password')} placeholder="Min. 6 characters" error={errors.password} />
            <Field id="su-confirm" label="Confirm Password" type="password" value={form.confirm} onChange={set('confirm')} placeholder="Repeat password" error={errors.confirm} />
            <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full py-3.5 rounded-xl font-bold text-base text-black
                   bg-gradient-to-r from-emerald-500 to-teal-500
                   hover:from-emerald-400 hover:to-teal-400
                   disabled:opacity-60 disabled:cursor-not-allowed
                   transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5
                   shadow-lg shadow-emerald-500/30"
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <SpinIcon /> Creating Account…
                    </span>
                ) : 'Create Account & Continue →'}
            </button>
        </form>
    );
}

/* ── Login Form ── */
function LoginForm({ onSuccess }) {
    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = {};
        if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = 'Enter a valid email.';
        if (!form.password) errs.password = 'Password is required.';
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setLoading(true);
        setTimeout(() => {
            const users = getUsers();
            const user = users.find((u) => u.email === form.email && u.password === form.password);
            if (!user) {
                setErrors({ password: 'Invalid email or password.' });
                setLoading(false);
                return;
            }
            setSession({ name: user.name, email: user.email, age: user.age });
            setLoading(false);
            onSuccess();
        }, 600);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Field id="li-email" label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" error={errors.email} />
            <Field id="li-pass" label="Password" type="password" value={form.password} onChange={set('password')} placeholder="Your password" error={errors.password} />
            <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full py-3.5 rounded-xl font-bold text-base text-black
                   bg-gradient-to-r from-emerald-500 to-teal-500
                   hover:from-emerald-400 hover:to-teal-400
                   disabled:opacity-60 disabled:cursor-not-allowed
                   transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5
                   shadow-lg shadow-emerald-500/30"
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <SpinIcon /> Logging In…
                    </span>
                ) : 'Log In & Continue →'}
            </button>
        </form>
    );
}

/* ── Main AuthPage ── */
export default function AuthPage() {
    const [mode, setMode] = useState('signup'); // 'signup' | 'login'
    const navigate = useNavigate();

    const onSuccess = () => navigate('/form');

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4 py-16
                    relative overflow-hidden">
            {/* Background glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px]
                      rounded-full bg-emerald-500/8 blur-[130px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full
                      bg-teal-400/5 blur-[80px] pointer-events-none" />

            <div className="relative w-full max-w-md">
                {/* Back to landing */}
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-1 text-white/40 hover:text-white/80 text-sm mb-8
                     transition-colors duration-200 group"
                >
                    <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
                    Back to home
                </button>

                {/* Card */}
                <div className="bg-white/[0.03] border border-white/[0.09] rounded-3xl p-8 sm:p-10
                        backdrop-blur-xl shadow-2xl">
                    {/* Logo */}
                    <div className="flex items-center justify-center gap-2.5 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30
                            flex items-center justify-center">
                            <HeartPulseIcon size={20} />
                        </div>
                        <span className="text-xl font-bold">
                            Vital<span className="text-emerald-400">Scan</span>
                        </span>
                    </div>

                    {/* Toggle */}
                    <div className="flex bg-white/[0.05] rounded-xl p-1 mb-8 gap-1">
                        {['signup', 'login'].map((m) => (
                            <button
                                key={m}
                                onClick={() => setMode(m)}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
                            ${mode === m
                                        ? 'bg-emerald-500 text-black shadow-md'
                                        : 'text-white/50 hover:text-white/80'
                                    }`}
                            >
                                {m === 'signup' ? 'Sign Up' : 'Log In'}
                            </button>
                        ))}
                    </div>

                    {/* Title */}
                    <div className="mb-7">
                        <h1 className="text-2xl font-bold">
                            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
                        </h1>
                        <p className="text-white/40 text-sm mt-1">
                            {mode === 'signup'
                                ? 'Start your free health risk assessment today.'
                                : 'Log in to access your risk profile.'}
                        </p>
                    </div>

                    {/* Forms — animate swap */}
                    <div key={mode} className="animate-fadein">
                        {mode === 'signup'
                            ? <SignUpForm onSuccess={onSuccess} />
                            : <LoginForm onSuccess={onSuccess} />
                        }
                    </div>

                    {/* Switch mode */}
                    <p className="text-center text-white/40 text-sm mt-6">
                        {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
                        <button
                            onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
                            className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors duration-200"
                        >
                            {mode === 'signup' ? 'Log In' : 'Sign Up'}
                        </button>
                    </p>

                    <p className="text-center text-white/20 text-xs mt-6">
                        For hackathon demo purposes only. No real data stored externally.
                    </p>
                </div>
            </div>

            <style>{`
        @keyframes fadein {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadein { animation: fadein 0.25s ease-out forwards; }
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

function SpinIcon() {
    return (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
    );
}
