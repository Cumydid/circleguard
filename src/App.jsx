import React, { useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'

import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import FollowersPage from './pages/FollowersPage.jsx'
import BotsPage from './pages/BotsPage.jsx'
import UnfollowPage from './pages/UnfollowPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import Sidebar from './components/Sidebar.jsx'

function ProtectedLayout({ children }) {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) navigate('/login')
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0a0e1a', flexDirection: 'column', gap: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 24px rgba(59,130,246,0.4)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" fill="white" />
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px' }}>FlockWatch</div>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#3b82f6' }}>Loading...</div>
          </div>
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
      </div>
    )
  }

  if (!user) return null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0e1a' }}>
      <Sidebar />
      <main style={{
        flex: 1, overflow: 'auto', minWidth: 0,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {/* Subtle scanline overlay */}
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(59,130,246,0.01) 0px, transparent 1px, transparent 3px)',
          backgroundSize: '100% 4px',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </div>
      </main>
    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={
        <ProtectedLayout><DashboardPage /></ProtectedLayout>
      } />
      <Route path="/followers" element={
        <ProtectedLayout><FollowersPage /></ProtectedLayout>
      } />
      <Route path="/bots" element={
        <ProtectedLayout><BotsPage /></ProtectedLayout>
      } />
      <Route path="/unfollow" element={
        <ProtectedLayout><UnfollowPage /></ProtectedLayout>
      } />
      <Route path="/settings" element={
        <ProtectedLayout><SettingsPage /></ProtectedLayout>
      } />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  )
}
