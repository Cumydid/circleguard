import React from 'react'
import { ExternalLink, UserX } from 'lucide-react'
import { CircularBotScore } from './BotScoreBar.jsx'
import { getBotScoreLabel } from '../utils/botDetection.js'

export default function UserCard({ user, onUnfollow, selectable, selected, onSelect }) {
  const initials = (user.name || user.username || '?').slice(0, 2).toUpperCase()

  return (
    <div
      onClick={selectable ? () => onSelect?.(user.id) : undefined}
      style={{
        background: selected ? '#1e3a5f' : '#131929',
        border: selected ? '1px solid #3b82f6' : '1px solid #1e2a4a',
        borderRadius: 12,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        cursor: selectable ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        if (!selected) {
          e.currentTarget.style.borderColor = '#1e3a5f'
          e.currentTarget.style.background = '#161e30'
        }
      }}
      onMouseLeave={e => {
        if (!selected) {
          e.currentTarget.style.borderColor = '#1e2a4a'
          e.currentTarget.style.background = '#131929'
        }
      }}
    >
      {selectable && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          width: 18, height: 18, borderRadius: 4,
          border: selected ? '2px solid #3b82f6' : '2px solid #1e2a4a',
          background: selected ? '#3b82f6' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s ease',
        }}>
          {selected && <svg width="10" height="10" viewBox="0 0 10 10"><polyline points="1.5,5 4,7.5 8.5,2.5" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" /></svg>}
        </div>
      )}

      {/* Avatar + score */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt={user.name}
              style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid #1e2a4a', flexShrink: 0 }}
              onError={e => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
          ) : null}
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'linear-gradient(135deg, #1e2a4a, #0f1629)',
            border: '2px solid #1e2a4a',
            display: user.profileImageUrl ? 'none' : 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Syne, sans-serif', fontWeight: 700,
            fontSize: 16, color: '#475569', flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name || '—'}
            </div>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: '#60a5fa', marginTop: 2 }}>
              @{user.username}
            </div>
          </div>
        </div>
        <CircularBotScore score={user.botScore || 0} size={64} />
      </div>

      {/* Bio */}
      {user.bio ? (
        <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {user.bio}
        </p>
      ) : (
        <p style={{ fontSize: 12, color: '#475569', fontStyle: 'italic' }}>No biography</p>
      )}

      {/* Bot signals */}
      {user.botSignals && user.botSignals.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {user.botSignals.map((signal, i) => (
            <div key={i} style={{
              fontSize: 11, color: '#f59e0b',
              fontFamily: 'Space Mono, monospace',
              background: 'rgba(245,158,11,0.06)',
              border: '1px solid rgba(245,158,11,0.15)',
              borderRadius: 4, padding: '3px 8px',
            }}>
              {signal}
            </div>
          ))}
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 12, paddingTop: 4, borderTop: '1px solid #1e2a4a' }}>
        {[
          { label: 'Followers', value: (user.followersCount || 0).toLocaleString() },
          { label: 'Following', value: (user.followingCount || 0).toLocaleString() },
          { label: 'Tweets', value: (user.tweetCount || 0).toLocaleString() },
        ].map(stat => (
          <div key={stat.label} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{stat.value}</div>
            <div style={{ fontSize: 10, color: '#475569', marginTop: 2, fontFamily: 'Syne, sans-serif' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      {onUnfollow && !selectable && (
        <button
          onClick={e => { e.stopPropagation(); onUnfollow(user.id) }}
          style={{
            width: '100%', padding: '8px', border: '1px solid #ef444430',
            borderRadius: 8, background: 'rgba(239,68,68,0.06)',
            color: '#ef4444', cursor: 'pointer',
            fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.borderColor = '#ef4444' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; e.currentTarget.style.borderColor = '#ef444430' }}
        >
          <UserX size={14} />
          Unfollow
        </button>
      )}
    </div>
  )
}
