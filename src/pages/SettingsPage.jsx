import React, { useState } from 'react'
import { Settings, Bell, Shield, Trash2, LogOut, Moon, Globe } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.jsx'

function SettingRow({ label, desc, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '16px 0', borderBottom: '1px solid #1e2a4a', flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', fontFamily: 'Syne, sans-serif' }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: '#475569', marginTop: 3, fontFamily: 'Space Mono, monospace' }}>{desc}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )
}

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 44, height: 24, borderRadius: 12,
        background: value ? '#3b82f6' : '#1e2a4a',
        border: 'none', cursor: 'pointer', position: 'relative',
        transition: 'background 0.2s ease',
        boxShadow: value ? '0 0 10px rgba(59,130,246,0.4)' : 'none',
      }}
    >
      <div style={{
        position: 'absolute', top: 3, left: value ? 23 : 3,
        width: 18, height: 18, borderRadius: '50%',
        background: '#fff',
        transition: 'left 0.2s ease',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }} />
    </button>
  )
}

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const [settings, setSettings] = useState({
    botAlerts: true,
    weeklyReport: false,
    autoScan: true,
    showVerified: true,
    darkMode: true,
    rateLimit: true,
  })

  const toggle = (key) => setSettings(s => ({ ...s, [key]: !s[key] }))

  return (
    <div style={{ padding: 32, animation: 'pageFadeIn 0.4s ease forwards', maxWidth: 700 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px', marginBottom: 6 }}>Settings</h1>
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: '#475569' }}>Manage your FlockWatch preferences</p>
      </div>

      {/* Connected account */}
      <div style={{ background: '#131929', border: '1px solid #1e2a4a', borderRadius: 14, padding: '24px', marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Globe size={16} color="#60a5fa" /> Connected Account
        </h3>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px', background: '#0f1629', borderRadius: 10, border: '1px solid #1e2a4a', marginBottom: 14 }}>
            <img src={user.profileImageUrl || `https://i.pravatar.cc/48?u=${user.username}`} alt={user.name}
              style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid #3b82f6' }}
              onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.username)}&background=1e2a4a&color=60a5fa&size=48` }}
            />
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{user.name}</div>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: '#60a5fa' }}>@{user.username}</div>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#475569', marginTop: 2 }}>
                {(user.followersCount || 0).toLocaleString()} followers · {(user.followingCount || 0).toLocaleString()} following
              </div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <span style={{ padding: '4px 10px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 20, fontSize: 11, color: '#22c55e', fontFamily: 'Space Mono, monospace' }}>● DEMO CONNECTED</span>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px',
            border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8,
            background: 'rgba(239,68,68,0.06)', color: '#ef4444', cursor: 'pointer',
            fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.14)'; e.currentTarget.style.borderColor = '#ef4444' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)' }}
        >
          <LogOut size={14} />
          Disconnect Account
        </button>
      </div>

      {/* Notifications */}
      <div style={{ background: '#131929', border: '1px solid #1e2a4a', borderRadius: 14, padding: '24px', marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bell size={16} color="#f59e0b" /> Notifications
        </h3>
        <p style={{ fontSize: 12, color: '#475569', marginBottom: 16, fontFamily: 'Space Mono, monospace' }}>Control what alerts you receive</p>
        <SettingRow label="Bot Detection Alerts" desc="Notify when new bots are detected in your followers">
          <Toggle value={settings.botAlerts} onChange={() => toggle('botAlerts')} />
        </SettingRow>
        <SettingRow label="Weekly Analytics Report" desc="Get a summary of your follower growth every week">
          <Toggle value={settings.weeklyReport} onChange={() => toggle('weeklyReport')} />
        </SettingRow>
        <SettingRow label="Unfollow Confirmations" desc="Show confirmation before bulk unfollowing">
          <Toggle value={true} onChange={() => {}} />
        </SettingRow>
      </div>

      {/* Bot detection */}
      <div style={{ background: '#131929', border: '1px solid #1e2a4a', borderRadius: 14, padding: '24px', marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={16} color="#ef4444" /> Bot Detection
        </h3>
        <p style={{ fontSize: 12, color: '#475569', marginBottom: 16, fontFamily: 'Space Mono, monospace' }}>Configure bot scoring behavior</p>
        <SettingRow label="Auto-scan new followers" desc="Automatically run bot detection on new followers">
          <Toggle value={settings.autoScan} onChange={() => toggle('autoScan')} />
        </SettingRow>
        <SettingRow label="Flag verified accounts as clean" desc="Skip bot scoring for Twitter-verified accounts">
          <Toggle value={settings.showVerified} onChange={() => toggle('showVerified')} />
        </SettingRow>
        <SettingRow label="Bot score threshold" desc="Accounts above this score are flagged as bots">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="range" min={30} max={90} defaultValue={60}
              style={{ width: 100, accentColor: '#3b82f6' }}
            />
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, color: '#60a5fa', minWidth: 32 }}>60</span>
          </div>
        </SettingRow>
      </div>

      {/* Rate limiting */}
      <div style={{ background: '#131929', border: '1px solid #1e2a4a', borderRadius: 14, padding: '24px', marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Settings size={16} color="#94a3b8" /> API & Rate Limits
        </h3>
        <p style={{ fontSize: 12, color: '#475569', marginBottom: 16, fontFamily: 'Space Mono, monospace' }}>Configure request throttling behavior</p>
        <SettingRow label="Respect rate limits" desc="Throttle unfollow actions to stay within Twitter's limits">
          <Toggle value={settings.rateLimit} onChange={() => toggle('rateLimit')} />
        </SettingRow>
        <div style={{ marginTop: 16, padding: '12px 14px', background: '#0f1629', border: '1px solid #1e2a4a', borderRadius: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, textAlign: 'center' }}>
            {[
              { label: 'Unfollows/day', value: '~400' },
              { label: 'API calls/15m', value: '75' },
              { label: 'Scan delay', value: '500ms' },
            ].map(item => (
              <div key={item.label}>
                <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 16, fontWeight: 700, color: '#60a5fa' }}>{item.value}</div>
                <div style={{ fontSize: 11, color: '#475569', marginTop: 2, fontFamily: 'Syne, sans-serif' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 14, padding: '24px' }}>
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: '#ef4444', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Trash2 size={16} /> Danger Zone
        </h3>
        <p style={{ fontSize: 12, color: '#475569', marginBottom: 16, fontFamily: 'Space Mono, monospace' }}>Irreversible actions</p>
        <button
          style={{
            padding: '10px 18px', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8,
            background: 'transparent', color: '#ef4444', cursor: 'pointer',
            fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = '#ef4444' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)' }}
        >
          <Trash2 size={14} />
          Clear Cached Data
        </button>
      </div>

      <style>{`
        @keyframes pageFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
