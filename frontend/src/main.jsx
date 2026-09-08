import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import { NotificationProvider } from './components/NotificationContext.jsx'
import { LatencyProvider } from './components/LatencyContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import './index.css'

// Register PWA Service Worker for Offline Resilience
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('MAAOS Service Worker registered successfully:', registration.scope)
      })
      .catch((error) => {
        console.error('MAAOS Service Worker registration failed:', error)
      })
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <LatencyProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<DashboardPage />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </LatencyProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
