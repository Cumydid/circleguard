import React from 'react'
import { Search, Filter, X } from 'lucide-react'

const FILTER_OPTS = [
  { key: 'botsOnly', label: 'Bots Only' },
  { key: 'notFollowingBack', label: 'Not Following Back' },
  { key: 'inactive', label: 'Inactive (< 10 tweets)' },
  { key: 'noProfilePic', label: 'No Profile Pic' },
]

export default function FilterBar({ search, onSearch, filters, onFilterChange, count, total }) {
  const activeCount = Object.values(filters || {}).filter(Boolean).length

  return (
    <div style={{
      background: '#0f1629',
      border: '1px solid #1e2a4a',
      borderRadius: 12,
      padding: '14px 16px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: 12,
      alignItems: 'center',
    }}>
      {/* Search */}
      <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' }} />
        <input
          type="text"
          placeholder="Search by username or name..."
          value={search}
          onChange={e => onSearch(e.target.value)}
          style={{
            width: '100%', padding: '9px 12px 9px 36px',
            background: '#131929', border: '1px solid #1e2a4a', borderRadius: 8,
            color: '#f1f5f9', fontFamily: 'Space Mono, monospace', fontSize: 13,
            outline: 'none', transition: 'border-color 0.15s ease',
          }}
          onFocus={e => e.target.style.borderColor = '#3b82f6'}
          onBlur={e => e.target.style.borderColor = '#1e2a4a'}
        />
        {search && (
          <button
            onClick={() => onSearch('')}
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center', padding: 2 }}
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#475569' }}>
          <Filter size={13} />
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11 }}>Filters</span>
          {activeCount > 0 && (
            <span style={{
              background: '#3b82f6', color: '#fff',
              borderRadius: '50%', width: 16, height: 16,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontFamily: 'Space Mono, monospace', fontWeight: 700,
            }}>{activeCount}</span>
          )}
        </div>
        {FILTER_OPTS.map(opt => {
          const active = filters?.[opt.key]
          return (
            <button
              key={opt.key}
              onClick={() => onFilterChange(opt.key, !active)}
              style={{
                padding: '5px 12px',
                borderRadius: 20,
                border: active ? '1px solid #3b82f6' : '1px solid #1e2a4a',
                background: active ? 'rgba(59,130,246,0.15)' : '#131929',
                color: active ? '#60a5fa' : '#94a3b8',
                cursor: 'pointer',
                fontFamily: 'Syne, sans-serif', fontSize: 12, fontWeight: 500,
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = '#3b82f644'; e.currentTarget.style.color = '#f1f5f9' } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = '#1e2a4a'; e.currentTarget.style.color = '#94a3b8' } }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      {/* Count */}
      <div style={{ marginLeft: 'auto', fontFamily: 'Space Mono, monospace', fontSize: 12, color: '#475569', whiteSpace: 'nowrap' }}>
        <span style={{ color: '#f1f5f9' }}>{(count || 0).toLocaleString()}</span> / {(total || 0).toLocaleString()}
      </div>
    </div>
  )
}
