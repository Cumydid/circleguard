import React, { useEffect, useState, useMemo } from 'react'
import { UserX, Bot, Clock, AlertTriangle, CheckSquare, Square, Trash2 } from 'lucide-react'
import ProgressModal from '../components/ProgressModal.jsx'
import { useFollowers } from '../hooks/useFollowers.jsx'
import { MOCK_FOLLOWING, MOCK_FOLLOWERS } from '../utils/mockData.js'

const TABS = [
  { key: 'nonFollowers', label: 'Non-Followers', icon: UserX, desc: 'You follow them, they don\'t follow back' },
  { key: 'bots', label: 'Bots', icon: Bot, desc: 'Flagged accounts with bot score ≥ 60' },
  { key: 'inactive', label: 'Inactive', icon: Clock, desc: 'Accounts with fewer than 10 tweets' },
]

function UserRow({ user, selected, onToggle }) {
  return (
    <div
      onClick={() => onToggle(user.id)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px',
        background: selected ? '#1e3a5f' : 'transparent',
        cursor: 'pointer',
        transition: 'background 0.15s ease',
        borderTop: selected ? '1px solid #3b82f644' : '1px solid transparent',
        borderLeft: selected ? '1px solid #3b82f644' : '1px solid transparent',
        borderRight: selected ? '1px solid #3b82f644' : '1px solid transparent',
        borderBottom: '1px solid #1e2a4a',
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = '#1e2a4a' }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent' }}
    >
      {/* Checkbox */}
      <div style={{
        width: 18, height: 18, borderRadius: 4,
        border: selected ? '2px solid #3b82f6' : '2px solid #2a3a5a',
        background: selected ? '#3b82f6' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, transition: 'all 0.15s ease',
      }}>
        {selected && <svg width="10" height="10" viewBox="0 0 10 10"><polyline points="1.5,5 4,7.5 8.5,2.5" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" /></svg>}
      </div>

      {/* Avatar */}
      {user.profileImageUrl ? (
        <img src={user.profileImageUrl} alt={user.name}
          style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid #1e2a4a', flexShrink: 0 }}
          onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=1e2a4a&color=60a5fa&size=40` }}
        />
      ) : (
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1e2a4a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#475569', flexShrink: 0, fontFamily: 'Syne, sans-serif', border: '1px solid #2a3a5a' }}>
          {(user.username || '?')[0].toUpperCase()}
        </div>
      )}

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.name || user.username}
        </div>
        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#60a5fa', marginTop: 2 }}>
          @{user.username}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
        {[
          { label: 'Flwrs', value: (user.followersCount || 0).toLocaleString() },
          { label: 'Tweets', value: (user.tweetCount || 0).toLocaleString() },
        ].map(stat => (
          <div key={stat.label} style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: '#f1f5f9', fontWeight: 700 }}>{stat.value}</div>
            <div style={{ fontSize: 10, color: '#475569', fontFamily: 'Syne, sans-serif' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Bot score badge */}
      {user.botScore >= 60 && (
        <span style={{ padding: '2px 8px', borderRadius: 20, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', fontSize: 10, fontFamily: 'Space Mono, monospace', flexShrink: 0, fontWeight: 700 }}>
          BOT {user.botScore}
        </span>
      )}
    </div>
  )
}

export default function UnfollowPage() {
  const { following, bots, loading, fetchFollowing, fetchBots, unfollow, removeFromState, followers } = useFollowers()
  const [activeTab, setActiveTab] = useState('nonFollowers')
  const [selected, setSelected] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    fetchFollowing()
    fetchBots()
  }, [])

  useEffect(() => { setSelected([]) }, [activeTab])

  // Build tab lists using mock data as fallback
  const nonFollowers = useMemo(() => {
    const list = following.length > 0 ? following : MOCK_FOLLOWING
    return list.filter(f => !f.followsYouBack)
  }, [following])

  const botList = useMemo(() => {
    return bots.length > 0 ? bots : MOCK_FOLLOWERS.filter(f => f.botScore >= 60)
  }, [bots])

  const inactiveList = useMemo(() => {
    const allFollowers = followers.length > 0 ? followers : MOCK_FOLLOWERS
    return allFollowers.filter(f => f.tweetCount < 10)
  }, [followers])

  const tabData = { nonFollowers, bots: botList, inactive: inactiveList }
  const currentList = tabData[activeTab] || []

  const allSelected = currentList.length > 0 && currentList.every(u => selected.includes(u.id))

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const selectAll = () => {
    setSelected(allSelected ? [] : currentList.map(u => u.id))
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  const selectedUsers = currentList.filter(u => selected.includes(u.id))

  return (
    <div style={{ padding: 32, animation: 'pageFadeIn 0.4s ease forwards' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px', marginBottom: 6 }}>
          Unfollow Manager
        </h1>
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: '#475569' }}>
          Selectively unfollow accounts to clean your network
        </p>
      </div>

      {/* Rate limit warning */}
      <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <AlertTriangle size={16} color="#f59e0b" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: '#f59e0b', fontFamily: 'Space Mono, monospace', lineHeight: 1.5 }}>
          Twitter limits unfollows to ~400/day. Actions are throttled to respect rate limits.
        </span>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 2, background: '#0f1629', border: '1px solid #1e2a4a', borderRadius: 12, padding: 4, marginBottom: 20 }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1, padding: '10px 12px',
              border: 'none', borderRadius: 9,
              background: activeTab === tab.key ? '#131929' : 'transparent',
              color: activeTab === tab.key ? '#f1f5f9' : '#475569',
              cursor: 'pointer',
              fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.15s ease',
              boxShadow: activeTab === tab.key ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
            }}
          >
            <tab.icon size={14} />
            <span>{tab.label}</span>
            <span style={{
              background: activeTab === tab.key ? '#3b82f6' : '#1e2a4a',
              color: activeTab === tab.key ? '#fff' : '#475569',
              borderRadius: 20, padding: '1px 7px',
              fontFamily: 'Space Mono, monospace', fontSize: 11, fontWeight: 700,
              minWidth: 24, textAlign: 'center',
            }}>
              {tabData[tab.key]?.length || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Tab desc */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: '#475569', fontFamily: 'Syne, sans-serif' }}>
          {TABS.find(t => t.key === activeTab)?.desc}
        </p>
      </div>

      {/* List */}
      <div style={{ background: '#131929', border: '1px solid #1e2a4a', borderRadius: 12, overflow: 'hidden', marginBottom: selected.length > 0 ? 80 : 24 }}>
        {/* List header */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e2a4a', display: 'flex', alignItems: 'center', gap: 12, background: '#0f1629' }}>
          <button onClick={selectAll} style={{ background: 'none', border: 'none', cursor: 'pointer', color: allSelected ? '#3b82f6' : '#475569', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600, padding: '4px 8px', borderRadius: 6, transition: 'color 0.15s ease' }}
            onMouseEnter={e => e.currentTarget.style.color = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.color = allSelected ? '#3b82f6' : '#475569'}
          >
            {allSelected ? <CheckSquare size={16} color="#3b82f6" /> : <Square size={16} />}
            Select All
          </button>
          <div style={{ marginLeft: 'auto', fontFamily: 'Space Mono, monospace', fontSize: 12, color: '#475569' }}>
            <span style={{ color: '#f1f5f9', fontWeight: 700 }}>{selected.length}</span> selected
          </div>
        </div>

        {loading ? (
          <div>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '14px 16px', borderBottom: '1px solid #1e2a4a', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.1}s` }}>
                <div style={{ width: 18, height: 18, borderRadius: 4, background: '#1e2a4a' }} />
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1e2a4a' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 13, background: '#1e2a4a', borderRadius: 4, width: '25%', marginBottom: 6 }} />
                  <div style={{ height: 11, background: '#1e2a4a', borderRadius: 4, width: '15%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : currentList.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 600, color: '#f1f5f9', marginBottom: 6 }}>
              All clear!
            </div>
            <div style={{ fontSize: 13, color: '#475569' }}>No accounts in this category</div>
          </div>
        ) : (
          currentList.map(user => (
            <UserRow
              key={user.id}
              user={user}
              selected={selected.includes(user.id)}
              onToggle={toggleSelect}
            />
          ))
        )}
      </div>

      {/* Sticky unfollow bar */}
      {selected.length > 0 && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          padding: '16px 32px',
          background: '#0b1120', borderTop: '1px solid #1e2a4a',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          zIndex: 50, animation: 'slideUpBar 0.2s ease',
          backdropFilter: 'blur(10px)',
        }}>
          <div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>
              {selected.length} account{selected.length !== 1 ? 's' : ''} selected
            </div>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#475569', marginTop: 2 }}>
              Est. time: ~{Math.ceil(selected.length * 0.5)} seconds
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setSelected([])}
              style={{ padding: '10px 18px', border: '1px solid #1e2a4a', borderRadius: 10, background: '#131929', color: '#94a3b8', cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600, transition: 'all 0.15s ease' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#475569'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#1e2a4a'}
            >
              Cancel
            </button>
            <button
              onClick={() => setModalOpen(true)}
              style={{
                padding: '10px 24px', border: 'none', borderRadius: 10,
                background: '#ef4444', color: '#fff', cursor: 'pointer',
                fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 4px 20px rgba(239,68,68,0.35)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.transform = 'scale(1.02)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.transform = 'scale(1)' }}
            >
              <Trash2 size={16} />
              Unfollow Selected ({selected.length})
            </button>
          </div>
        </div>
      )}

      {/* Progress modal */}
      <ProgressModal
        open={modalOpen}
        userIds={selected}
        users={currentList}
        onUnfollow={unfollow}
        onDone={() => {
          removeFromState(selected)
          const count = selected.length
          setSelected([])
          showToast(`Successfully unfollowed ${count} accounts`)
        }}
        onClose={() => setModalOpen(false)}
      />

      {toast && (
        <div style={{
          position: 'fixed', bottom: 90, right: 24, zIndex: 2000,
          background: '#131929', border: '1px solid #22c55e',
          borderRadius: 10, padding: '12px 18px', color: '#22c55e',
          fontFamily: 'Space Mono, monospace', fontSize: 13,
          boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
          animation: 'slideInRight 0.3s ease',
        }}>
          ✓ {toast}
        </div>
      )}

      <style>{`
        @keyframes pageFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes slideUpBar { from { opacity: 0; transform: translateY(100%); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @media (max-width: 768px) { div[style*="padding: 32px"] { padding: 16px !important; } }
      `}</style>
    </div>
  )
}
