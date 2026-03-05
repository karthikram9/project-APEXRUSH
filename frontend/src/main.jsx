import { StrictMode } from 'react'
import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: 40, color: 'white',
          background: '#0a0a0a',
          minHeight: '100vh',
          fontFamily: 'monospace'
        }}>
          <h2 style={{ color: '#ef4444' }}>
            App Error
          </h2>
          <pre style={{ 
            color: '#fbbf24',
            whiteSpace: 'pre-wrap'
          }}>
            {this.state.error?.toString()}
          </pre>
          <p style={{ color: '#9ca3af' }}>
            Check browser console F12 for full details.
          </p>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
