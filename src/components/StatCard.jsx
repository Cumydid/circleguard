import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function StatCard({ icon: Icon, label, value, sub, trend, trendValue, color = '#3b82f6', loading = false }) {
  const trendColor = trend === 'up' ? '#22c55e' : trend === 'down' ? '#ef4444' : '#475569'
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  return (
    <div style={{
      background: '#131929',
      border: '1px solid #1e2a4a',
      borderRadius: 12,
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      position: 'relative',
      overflow: 'hidden',
      transition: 'border-color 0.2s ease, transform 0.2s ease',
      cursor: 'default',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = color + '44'
      e.currentTarget.style.transform = 'translateY(-1px)'
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = '#1e2a4a'
      e.currentTarget.style.transform = 'translateY(0)'
    }}
    >
      {/* Glow accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        opacity: 0.6,
      }} />

      {/* Corner glow */}
      <div style={{
        position: 'absolute', top: -30, right: -30,
        width: 100, height: 100, borderRadius: '50%',
        background: color,
        opacity: 0.04,
        filter: 'blur(20px)',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: color + '18',
          border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {Icon && <Icon size={20} color={color} />}
        </div>
        {trendValue !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: trendColor, fontFamily: 'Space Mono, monospace', fontSize: 11 }}>
            <TrendIcon size={12} />
            <span>{trendValue}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div>
          <div style={{ height: 32, width: '60%', background: '#1e2a4a', borderRadius: 6, marginBottom: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ height: 14, width: '40%', background: '#1e2a4a', borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
      ) : (
        <div>
          <div style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: 28,
            fontWeight: 700,
            color: '#f1f5f9',
            letterSpacing: '-0.5px',
            lineHeight: 1,
          }}>
            {value}
          </div>
          <div style={{ marginTop: 6, fontSize: 13, color: '#94a3b8', fontFamily: 'Syne, sans-serif', fontWeight: 500 }}>
            {label}
          </div>
          {sub && (
            <div style={{ marginTop: 4, fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#475569' }}>
              {sub}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
