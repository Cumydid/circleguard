import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, Bot, UserMinus, Settings,
  LogOut, ChevronLeft, ChevronRight, Wifi
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth.jsx'

const NAV_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/followers', icon: Users, label: 'Followers' },
  { path: '/bots', icon: Bot, label: 'Bot Detection' },
  { path: '/unfollow', icon: UserMinus, label: 'Unfollow Manager' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside style={{
        width: collapsed ? 72 : 240,
        minHeight: '100vh',
        background: '#0b1120',
        borderRight: '1px solid #1e2a4a',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
        flexShrink: 0,
        position: 'relative',
        zIndex: 10,
      }} className="desktop-sidebar">
        {/* Logo */}
        <div style={{
          padding: collapsed ? '20px 0' : '20px 20px',
          borderBottom: '1px solid #1e2a4a',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          justifyContent: collapsed ? 'center' : 'flex-start',
          minHeight: 72,
        }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 0 16px rgba(59,130,246,0.4)',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"
                fill="#fff" />
            </svg>
          </div>
          {!collapsed && (
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: '#f1f5f9', letterSpacing: '-0.5px' }}>
                FlockWatch
              </div>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#3b82f6', letterSpacing: '0.05em' }}>
                ANALYTICS
              </div>
            </div>
          )}
        </div>

        {/* Status indicator */}
        {!collapsed && (
          <div style={{ padding: '10px 20px', borderBottom: '1px solid #1e2a4a' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 6, padding: '5px 10px' }}>
              <Wifi size={11} color="#22c55e" />
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#22c55e', letterSpacing: '0.05em' }}>DEMO MODE ACTIVE</span>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {NAV_ITEMS.map(item => {
            const active = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/')
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                title={collapsed ? item.label : undefined}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: collapsed ? '12px 0' : '11px 20px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  background: active ? 'rgba(59,130,246,0.12)' : 'transparent',
                  border: 'none',
                  borderLeft: active ? '3px solid #3b82f6' : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  color: active ? '#60a5fa' : '#94a3b8',
                  fontFamily: 'Syne, sans-serif',
                  fontSize: 14,
                  fontWeight: active ? 600 : 500,
                  letterSpacing: '0.01em',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'rgba(59,130,246,0.06)'
                    e.currentTarget.style.color = '#f1f5f9'
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#94a3b8'
                  }
                }}
              >
                <item.icon size={18} />
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && active && (
                  <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 8px #3b82f6' }} />
                )}
              </button>
            )
          })}
        </nav>

        {/* User info */}
        <div style={{ borderTop: '1px solid #1e2a4a', padding: collapsed ? '16px 0' : '16px 20px' }}>
          {!collapsed && user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <img
                src={user.profileImageUrl || `https://i.pravatar.cc/32?u=${user.username}`}
                alt={user.name}
                style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #1e2a4a', flexShrink: 0 }}
                onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${user.name || user.username}&background=1e2a4a&color=60a5fa&size=32` }}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name || user.username}
                </div>
                <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  @{user.username}
                </div>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            title="Logout"
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding: '8px 10px',
              background: 'transparent', border: '1px solid #1e2a4a',
              borderRadius: 8, cursor: 'pointer', color: '#475569',
              fontFamily: 'Syne, sans-serif', fontSize: 13,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#ef4444'
              e.currentTarget.style.color = '#ef4444'
              e.currentTarget.style.background = 'rgba(239,68,68,0.06)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#1e2a4a'
              e.currentTarget.style.color = '#475569'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <LogOut size={15} />
            {!collapsed && <span>Disconnect</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            position: 'absolute', top: '50%', right: -12,
            transform: 'translateY(-50%)',
            width: 24, height: 24, borderRadius: '50%',
            background: '#1e2a4a', border: '1px solid #2a3a5a',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#94a3b8', zIndex: 20,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#3b82f6'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#1e2a4a'; e.currentTarget.style.color = '#94a3b8' }}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="mobile-nav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: 64, background: '#0b1120',
        borderTop: '1px solid #1e2a4a',
        display: 'none', alignItems: 'center',
        justifyContent: 'space-around', zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {NAV_ITEMS.slice(0, 4).map(item => {
          const active = location.pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: active ? '#60a5fa' : '#475569',
                padding: '8px 16px',
                transition: 'color 0.15s ease',
              }}
            >
              <item.icon size={20} />
              <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 10 }}>{item.label.split(' ')[0]}</span>
            </button>
          )
        })}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-nav { display: flex !important; }
        }
      `}</style>
    </>
  )
}
