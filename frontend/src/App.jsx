import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import ProtectedRoute from './components/ProtectedRoute';
import InputForm from './components/InputForm';
import ResultsDashboard from './components/ResultsDashboard';
import DietPlan from './components/DietPlan';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-emerald-500/30 font-sans">
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* Protected pages — require vs_session in localStorage */}
          <Route path="/form" element={<ProtectedRoute><InputForm /></ProtectedRoute>} />
          <Route path="/results" element={<ProtectedRoute><ResultsDashboard /></ProtectedRoute>} />
          <Route path="/diet" element={<ProtectedRoute><DietPlan /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
