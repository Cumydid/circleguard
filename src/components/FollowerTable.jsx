import React, { useState } from 'react'
import { UserX, ChevronUp, ChevronDown, ExternalLink, CheckSquare, Square } from 'lucide-react'
import BotScoreBar, { BotScoreBadge } from './BotScoreBar.jsx'

const COLUMNS = [
  { key: 'username', label: 'User', sortable: true },
  { key: 'followersCount', label: 'Followers', sortable: true },
  { key: 'followingCount', label: 'Following', sortable: true },
  { key: 'tweetCount', label: 'Tweets', sortable: true },
  { key: 'botScore', label: 'Bot Score', sortable: true },
  { key: 'followsYouBack', label: 'Follows Back', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false },
]

export default function FollowerTable({ followers, onUnfollow, selectable, selected, onSelectChange, loading }) {
  const [sortKey, setSortKey] = useState('botScore')
  const [sortDir, setSortDir] = useState('desc')

  const handleSort = (key) => {
    if (!key) return
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const sorted = [...(followers || [])].sort((a, b) => {
    let aVal = a[sortKey]; let bVal = b[sortKey]
    if (typeof aVal === 'string') aVal = aVal.toLowerCase()
    if (typeof bVal === 'string') bVal = bVal.toLowerCase()
    if (aVal === null || aVal === undefined) aVal = -Infinity
    if (bVal === null || bVal === undefined) bVal = -Infinity
    if (typeof aVal === 'boolean') { aVal = aVal ? 1 : 0; bVal = bVal ? 1 : 0 }
    return sortDir === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1)
  })

  const allSelected = sorted.length > 0 && sorted.every(f => selected?.includes(f.id))
  const handleSelectAll = () => {
    if (allSelected) onSelectChange?.([])
    else onSelectChange?.(sorted.map(f => f.id))
  }

  if (loading) {
    return (
      <div style={{ background: '#131929', border: '1px solid #1e2a4a', borderRadius: 12, overflow: 'hidden' }}>
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{ padding: '14px 20px', borderBottom: '1px solid #1e2a4a', display: 'flex', gap: 12, alignItems: 'center', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.1}s` }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1e2a4a' }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: 13, background: '#1e2a4a', borderRadius: 4, width: '30%', marginBottom: 6 }} />
              <div style={{ height: 11, background: '#1e2a4a', borderRadius: 4, width: '20%' }} />
            </div>
            <div style={{ height: 13, background: '#1e2a4a', borderRadius: 4, width: 60 }} />
          </div>
        ))}
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      </div>
    )
  }

  return (
    <div style={{ background: '#131929', border: '1px solid #1e2a4a', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
          <thead>
            <tr style={{ background: '#0f1629', borderBottom: '1px solid #1e2a4a' }}>
              {selectable && (
                <th style={{ padding: '12px 16px', width: 44 }}>
                  <button onClick={handleSelectAll} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center' }}>
                    {allSelected ? <CheckSquare size={16} color="#3b82f6" /> : <Square size={16} />}
                  </button>
                </th>
              )}
              {COLUMNS.map(col => (
                <th key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  style={{
                    padding: '12px 16px', textAlign: 'left',
                    fontFamily: 'Space Mono, monospace', fontSize: 11,
                    color: sortKey === col.key ? '#60a5fa' : '#475569',
                    fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
                    cursor: col.sortable ? 'pointer' : 'default',
                    userSelect: 'none', whiteSpace: 'nowrap',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={e => { if (col.sortable) e.currentTarget.style.color = '#94a3b8' }}
                  onMouseLeave={e => { e.currentTarget.style.color = sortKey === col.key ? '#60a5fa' : '#475569' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((follower, idx) => {
              const isSelected = selected?.includes(follower.id)
              const rowBg = isSelected ? '#1e3a5f' : idx % 2 === 0 ? '#131929' : '#0f1629'

              return (
                <tr key={follower.id}
                  style={{
                    background: rowBg,
                    borderBottom: '1px solid #1e2a4a',
                    transition: 'background 0.15s ease',
                    cursor: selectable ? 'pointer' : 'default',
                  }}
                  onClick={selectable ? () => {
                    const newSelected = isSelected
                      ? (selected || []).filter(id => id !== follower.id)
                      : [...(selected || []), follower.id]
                    onSelectChange?.(newSelected)
                  } : undefined}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#1e2a4a' }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = rowBg }}
                >
                  {selectable && (
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{
                        width: 16, height: 16, borderRadius: 4,
                        border: isSelected ? '2px solid #3b82f6' : '2px solid #1e2a4a',
                        background: isSelected ? '#3b82f6' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s ease',
                      }}>
                        {isSelected && <svg width="9" height="9" viewBox="0 0 9 9"><polyline points="1,4.5 3.5,7 8,1.5" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" /></svg>}
                      </div>
                    </td>
                  )}
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {follower.profileImageUrl ? (
                        <img src={follower.profileImageUrl} alt={follower.name || follower.username}
                          style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid #1e2a4a', flexShrink: 0 }}
                          onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(follower.username)}&background=1e2a4a&color=60a5fa&size=36` }}
                        />
                      ) : (
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%', background: '#1e2a4a',
                          border: '1px solid #2a3a5a', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, fontWeight: 700, color: '#475569', flexShrink: 0, fontFamily: 'Syne, sans-serif',
                        }}>
                          {(follower.username || '?')[0].toUpperCase()}
                        </div>
                      )}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
                          {follower.name || follower.username}
                        </div>
                        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#60a5fa', marginTop: 1 }}>
                          @{follower.username}
                        </div>
                        {follower.bio && (
                          <div style={{ fontSize: 11, color: '#475569', marginTop: 2, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {follower.bio}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, color: '#f1f5f9' }}>
                      {(follower.followersCount || 0).toLocaleString()}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, color: '#f1f5f9' }}>
                      {(follower.followingCount || 0).toLocaleString()}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, color: '#f1f5f9' }}>
                      {(follower.tweetCount || 0).toLocaleString()}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', minWidth: 140 }}>
                    <BotScoreBar score={follower.botScore || 0} height={5} />
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {follower.followsYouBack ? (
                      <span style={{ padding: '3px 10px', borderRadius: 20, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e', fontSize: 11, fontFamily: 'Space Mono, monospace', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        ✓ Yes
                      </span>
                    ) : (
                      <span style={{ padding: '3px 10px', borderRadius: 20, background: 'rgba(71,85,105,0.15)', border: '1px solid #1e2a4a', color: '#475569', fontSize: 11, fontFamily: 'Space Mono, monospace', whiteSpace: 'nowrap' }}>
                        No
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {onUnfollow && (
                      <button
                        onClick={e => { e.stopPropagation(); onUnfollow(follower.id) }}
                        style={{
                          padding: '5px 12px', border: '1px solid #ef444430',
                          borderRadius: 6, background: 'rgba(239,68,68,0.06)',
                          color: '#ef4444', cursor: 'pointer',
                          fontFamily: 'Syne, sans-serif', fontSize: 12, fontWeight: 600,
                          display: 'flex', alignItems: 'center', gap: 4,
                          transition: 'all 0.15s ease', whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.borderColor = '#ef4444' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; e.currentTarget.style.borderColor = '#ef444430' }}
                      >
                        <UserX size={13} />
                        Unfollow
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {sorted.length === 0 && (
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 600, color: '#f1f5f9', marginBottom: 6 }}>No results found</div>
          <div style={{ fontSize: 13, color: '#475569' }}>Try adjusting your search or filters</div>
        </div>
      )}
    </div>
  )
}
