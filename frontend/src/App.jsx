import { useState, useEffect } from 'react'
import {
  BrowserRouter, Routes, Route, Navigate
} from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { firebaseAuth } from './firebase'
import { Toaster } from 'react-hot-toast'
import LandingPage from './components/LandingPage'
import AuthPage from './components/AuthPage'
import WelcomePage from './components/WelcomePage'
import Dashboard from './components/Dashboard'
import InputForm from './components/InputForm'
import ResultsDashboard from './components/ResultsDashboard'
import DietPlan from './components/DietPlan'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    const unsub = onAuthStateChanged(
      firebaseAuth, u => setUser(u))
    return () => unsub()
  }, [])

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]
        flex items-center justify-center">
        <div className="text-emerald-400 text-lg">
          Loading VitalScan...
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#1f2937',
          color: '#fff',
          border: '1px solid #10b981'
        }
      }} />
      <Routes>
        <Route path="/"
          element={<LandingPage />} />

        <Route path="/auth"
          element={user
            ? <Navigate to="/dashboard" />
            : <AuthPage />} />

        <Route path="/welcome"
          element={
            <ProtectedRoute user={user}>
              <WelcomePage user={user} />
            </ProtectedRoute>
          } />

        <Route path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <Dashboard user={user} />
            </ProtectedRoute>
          } />

        <Route path="/form"
          element={
            <ProtectedRoute user={user}>
              <InputForm />
            </ProtectedRoute>
          } />

        <Route path="/results"
          element={
            <ProtectedRoute user={user}>
              <ResultsDashboard />
            </ProtectedRoute>
          } />

        <Route path="/diet"
          element={
            <ProtectedRoute user={user}>
              <DietPlan />
            </ProtectedRoute>
          } />

        <Route path="*"
          element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
