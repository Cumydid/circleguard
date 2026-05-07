import React from 'react'
import { getBotScoreColor, getBotScoreLabel } from '../utils/botDetection.js'

export default function BotScoreBar({ score, showLabel = true, height = 6, width = '100%' }) {
  const color = getBotScoreColor(score)
  const label = getBotScoreLabel(score)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, width }}>
      <div style={{
        flex: 1,
        height,
        background: '#1e2a4a',
        borderRadius: height,
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{
          width: `${score}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          borderRadius: height,
          transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: score > 60 ? `0 0 6px ${color}66` : 'none',
        }} />
      </div>
      {showLabel && (
        <div style={{
          fontFamily: 'Space Mono, monospace',
          fontSize: 11,
          color,
          minWidth: 48,
          textAlign: 'right',
        }}>
          {score}<span style={{ color: '#475569', fontSize: 10 }}>/100</span>
        </div>
      )}
    </div>
  )
}

export function BotScoreBadge({ score }) {
  const color = getBotScoreColor(score)
  const label = getBotScoreLabel(score)

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '2px 8px',
      borderRadius: 20,
      background: color + '18',
      border: `1px solid ${color}30`,
      color,
      fontFamily: 'Space Mono, monospace',
      fontSize: 11,
      fontWeight: 700,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 4px ${color}` }} />
      {label}
    </span>
  )
}

export function CircularBotScore({ score, size = 100 }) {
  const color = getBotScoreColor(score)
  const r = (size - 14) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="#1e2a4a" strokeWidth={7} />
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={7}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 4px ${color}88)` }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontFamily: 'Space Mono, monospace', fontWeight: 700, fontSize: size * 0.22, color, lineHeight: 1 }}>
          {score}
        </div>
        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: size * 0.1, color: '#475569', marginTop: 2 }}>
          /100
        </div>
      </div>
    </div>
  )
}
