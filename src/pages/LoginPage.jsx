import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { Shield, Zap, BarChart2, Users } from 'lucide-react'

const FEATURES = [
  { icon: Users, text: 'Analyze your entire follower network' },
  { icon: Shield, text: 'Detect bots with AI-powered scoring' },
  { icon: Zap, text: 'Mass unfollow non-followers instantly' },
  { icon: BarChart2, text: 'Track growth and audience quality' },
]

export default function LoginPage() {
  const { user, login, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) navigate('/dashboard')
  }, [user, loading, navigate])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0e1a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated grid background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        pointerEvents: 'none',
      }} />

      {/* Glow orbs */}
      <div style={{ position: 'absolute', top: '10%', left: '15%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(96,165,250,0.06) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 900, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }} className="login-grid">
        {/* Left: Branding */}
        <div style={{ animation: 'fadeSlideIn 0.6s ease forwards' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
            <div style={{
              width: 52, height: 52,
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 30px rgba(59,130,246,0.4)',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" fill="white" />
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-1px' }}>FlockWatch</div>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#3b82f6', letterSpacing: '0.15em' }}>FOLLOWER ANALYTICS</div>
            </div>
          </div>

          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 42, fontWeight: 800, color: '#f1f5f9', lineHeight: 1.1, marginBottom: 16, letterSpacing: '-1.5px' }}>
            See who follows you.<br />
            <span style={{ background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Spot the bots.
            </span><br />
            Clean your audience.
          </h1>

          <p style={{ fontSize: 16, color: '#94a3b8', lineHeight: 1.7, marginBottom: 36, maxWidth: 380 }}>
            Professional-grade Twitter analytics. Identify bot accounts, track follower growth, and manage your network with surgical precision.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, animation: `fadeSlideIn 0.6s ease ${0.1 + i * 0.1}s forwards`, opacity: 0 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <f.icon size={15} color="#60a5fa" />
                </div>
                <span style={{ fontSize: 14, color: '#94a3b8', fontFamily: 'Syne, sans-serif', fontWeight: 500 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Login card */}
        <div style={{
          background: '#0f1629',
          border: '1px solid #1e2a4a',
          borderRadius: 20,
          padding: '40px 36px',
          textAlign: 'center',
          animation: 'fadeSlideIn 0.6s ease 0.2s forwards',
          opacity: 0,
          boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Top accent */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #3b82f6, #60a5fa, transparent)' }} />

          {/* X/Twitter logo */}
          <div style={{ marginBottom: 24 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: '#000',
              border: '2px solid #1e2a4a',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16,
            }}>
              {/* X logo from Simple Icons */}
              <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>
              Connect your account
            </h2>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6 }}>
              Authorize FlockWatch to read your Twitter follower data. We never post on your behalf.
            </p>
          </div>

          {/* Demo mode banner */}
          <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 24, textAlign: 'left' }}>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#f59e0b', fontWeight: 700, marginBottom: 3 }}>⚡ DEMO MODE</div>
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
              No real Twitter connection required. Click below to explore with 30 sample accounts.
            </div>
          </div>

          {/* Connect button */}
          <button
            onClick={login}
            style={{
              width: '100%', padding: '14px 24px',
              background: '#1d9bf0',
              border: 'none', borderRadius: 12,
              color: '#fff', cursor: 'pointer',
              fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 20px rgba(29,155,240,0.3)',
              marginBottom: 12,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#1a8cd8'
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(29,155,240,0.45)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#1d9bf0'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(29,155,240,0.3)'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Connect with Twitter / X
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: '#1e2a4a' }} />
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#475569' }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#1e2a4a' }} />
          </div>

          <button
            onClick={login}
            style={{
              width: '100%', padding: '12px 24px',
              background: 'rgba(59,130,246,0.08)',
              border: '1px solid #1e2a4a', borderRadius: 12,
              color: '#60a5fa', cursor: 'pointer',
              fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 600,
              transition: 'all 0.15s ease',
              marginBottom: 24,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.background = 'rgba(59,130,246,0.12)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e2a4a'; e.currentTarget.style.background = 'rgba(59,130,246,0.08)' }}
          >
            🚀 Enter Demo Mode (No Auth Required)
          </button>

          {/* Privacy note */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
              <svg width="8" height="8" viewBox="0 0 8 8"><polyline points="1,4 3,6 7,2" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </div>
            <p style={{ fontSize: 12, color: '#475569', textAlign: 'left', lineHeight: 1.6 }}>
              Read-only access to follower data. We never post tweets or store your credentials.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .login-grid { grid-template-columns: 1fr !important; max-width: 420px !important; }
        }
      `}</style>
    </div>
  )
}
