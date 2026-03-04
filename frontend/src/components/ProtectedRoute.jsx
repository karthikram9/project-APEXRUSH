import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Wraps a route so unauthenticated users are redirected to /auth.
 * Auth state is stored in localStorage under the key 'vs_session'.
 */
export default function ProtectedRoute({ children }) {
    const session = localStorage.getItem('vs_session');
    if (!session) {
        return <Navigate to="/auth" replace />;
    }
    return children;
}
