import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { firebaseAuth, firebaseDB } from '../firebase'

export default function AuthPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('signup')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: ''
  })

  const set = k => e =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const saveUserToFirestore = async (user) => {
    try {
      await setDoc(doc(firebaseDB, 'users', user.uid), {
        name: user.displayName || '',
        email: user.email || '',
        createdAt: new Date().toISOString(),
        uid: user.uid
      }, { merge: true })
    } catch (e) {
      console.error('Firestore save error:', e)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (mode === 'signup') {
      if (!form.name.trim()) {
        setError('Full name is required.')
        return
      }
      if (form.password.length < 6) {
        setError('Password must be at least 6 characters.')
        return
      }
      if (form.password !== form.confirm) {
        setError('Passwords do not match.')
        return
      }
    }

    if (!form.email.includes('@')) {
      setError('Enter a valid email address.')
      return
    }

    setLoading(true)
    try {
      if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(
          firebaseAuth, form.email, form.password)
        await updateProfile(cred.user, {
          displayName: form.name
        })
        await saveUserToFirestore(cred.user)
        navigate('/dashboard')
      } else {
        await signInWithEmailAndPassword(
          firebaseAuth, form.email, form.password)
        navigate('/dashboard')
      }
    } catch (err) {
      const msgs = {
        'auth/email-already-in-use': 'Account exists. Please log in.',
        'auth/user-not-found': 'No account found. Please sign up.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/invalid-email': 'Invalid email address.',
        'auth/weak-password': 'Password must be at least 6 characters.',
      }
      setError(msgs[err.code] || err.message)
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setLoading(true)
    setError('')
    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })
      const result = await signInWithPopup(firebaseAuth, provider)
      await saveUserToFirestore(result.user)
      navigate('/dashboard')
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google sign in failed. Try again.')
      }
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white
      flex items-center justify-center px-4 relative overflow-hidden">

      <div className="absolute top-0 left-1/2 -translate-x-1/2
        w-[600px] h-[400px] rounded-full bg-emerald-500/8
        blur-[120px] pointer-events-none"/>

      <div className="relative w-full max-w-md">
        <button onClick={() => navigate('/')}
          className="flex items-center gap-1 text-white/40
            hover:text-white/80 text-sm mb-8 transition-colors">
          ← Back to home
        </button>

        <div className="bg-white/[0.03] border border-white/[0.09]
          rounded-3xl p-8 backdrop-blur-xl shadow-2xl">

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">
              Vital<span className="text-emerald-400">Scan</span>
            </h1>
            <p className="text-white/40 text-sm mt-1">
              AI Health Risk Detection
            </p>
          </div>

          <div className="flex bg-white/[0.05] rounded-xl p-1 mb-6 gap-1">
            {['signup', 'login'].map(m => (
              <button key={m}
                onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2.5 rounded-lg text-sm
                  font-semibold transition-all
                  ${mode === m
                    ? 'bg-emerald-500 text-black'
                    : 'text-white/50 hover:text-white/80'}`}>
                {m === 'signup' ? 'Sign Up' : 'Log In'}
              </button>
            ))}
          </div>

          <div className="mb-5">
            <h2 className="text-xl font-bold">
              {mode === 'signup' ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-white/40 text-sm mt-1">
              {mode === 'signup'
                ? 'Start your free health assessment.'
                : 'Log in to your risk profile.'}
            </p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl
              bg-red-500/10 border border-red-500/20
              text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'signup' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/70">
                  Full Name
                </label>
                <input type="text" value={form.name}
                  onChange={set('name')} placeholder="Your full name"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.06]
                    border border-white/[0.12] text-white
                    placeholder-white/30 outline-none transition-all
                    focus:border-emerald-500/70 focus:ring-2
                    focus:ring-emerald-500/20"/>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white/70">Email</label>
              <input type="email" value={form.email}
                onChange={set('email')} placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.06]
                  border border-white/[0.12] text-white
                  placeholder-white/30 outline-none transition-all
                  focus:border-emerald-500/70 focus:ring-2
                  focus:ring-emerald-500/20"/>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white/70">Password</label>
              <input type="password" value={form.password}
                onChange={set('password')} placeholder="Min. 6 characters"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.06]
                  border border-white/[0.12] text-white
                  placeholder-white/30 outline-none transition-all
                  focus:border-emerald-500/70 focus:ring-2
                  focus:ring-emerald-500/20"/>
            </div>

            {mode === 'signup' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/70">
                  Confirm Password
                </label>
                <input type="password" value={form.confirm}
                  onChange={set('confirm')} placeholder="Repeat password"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.06]
                    border border-white/[0.12] text-white
                    placeholder-white/30 outline-none transition-all
                    focus:border-emerald-500/70 focus:ring-2
                    focus:ring-emerald-500/20"/>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="mt-2 w-full py-3.5 rounded-xl font-bold
                text-black bg-gradient-to-r from-emerald-500 to-teal-500
                hover:from-emerald-400 hover:to-teal-400
                disabled:opacity-60 disabled:cursor-not-allowed
                transition-all duration-200 shadow-lg shadow-emerald-500/30">
              {loading ? 'Please wait...'
                : mode === 'signup' ? 'Create Account →' : 'Log In →'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/40 text-sm">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button onClick={handleGoogle} disabled={loading}
            className="w-full flex items-center justify-center gap-3
              py-3 px-4 rounded-xl border border-white/10
              bg-white/5 hover:bg-white/10 text-white
              transition-all duration-200 disabled:opacity-60">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-white/40 text-sm mt-5">
            {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
            <button onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError('') }}
              className="text-emerald-400 font-semibold hover:text-emerald-300">
              {mode === 'signup' ? 'Log In' : 'Sign Up'}
            </button>
          </p>

          <p className="text-center text-white/20 text-xs mt-4">
            For hackathon demo purposes only.
          </p>
        </div>
      </div>
    </div>
  )
}
