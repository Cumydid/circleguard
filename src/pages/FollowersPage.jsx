import React, { useEffect, useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import FilterBar from '../components/FilterBar.jsx'
import FollowerTable from '../components/FollowerTable.jsx'
import ProgressModal from '../components/ProgressModal.jsx'
import { useFollowers } from '../hooks/useFollowers.jsx'

const PAGE_SIZE = 15

export default function FollowersPage() {
  const { followers, loading, fetchFollowers, unfollow, removeFromState } = useFollowers()
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({})
  const [page, setPage] = useState(1)
  const [unfollowTarget, setUnfollowTarget] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => { fetchFollowers() }, [])

  const handleFilterChange = (key, value) => {
    setFilters(f => ({ ...f, [key]: value }))
    setPage(1)
  }

  const filtered = useMemo(() => {
    let list = [...followers]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(f =>
        f.username.toLowerCase().includes(q) ||
        (f.name || '').toLowerCase().includes(q) ||
        (f.bio || '').toLowerCase().includes(q)
      )
    }
    if (filters.botsOnly) list = list.filter(f => f.botScore >= 60)
    if (filters.notFollowingBack) list = list.filter(f => !f.followsYouBack)
    if (filters.inactive) list = list.filter(f => f.tweetCount < 10)
    if (filters.noProfilePic) list = list.filter(f => !f.profileImageUrl)
    return list
  }, [followers, search, filters])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleUnfollow = (userId) => {
    const user = followers.find(f => f.id === userId)
    if (user) { setUnfollowTarget(user); setModalOpen(true) }
  }

  return (
    <div style={{ padding: 32, animation: 'pageFadeIn 0.4s ease forwards' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px', marginBottom: 6 }}>
            Followers
          </h1>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: '#475569' }}>
            {followers.length.toLocaleString()} accounts tracked
          </p>
        </div>
        <button
          onClick={fetchFollowers}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 16px',
            background: 'rgba(59,130,246,0.08)', border: '1px solid #1e2a4a', borderRadius: 10,
            color: '#60a5fa', cursor: 'pointer',
            fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.background = 'rgba(59,130,246,0.14)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e2a4a'; e.currentTarget.style.background = 'rgba(59,130,246,0.08)' }}
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Filter bar */}
      <div style={{ marginBottom: 16 }}>
        <FilterBar
          search={search}
          onSearch={q => { setSearch(q); setPage(1) }}
          filters={filters}
          onFilterChange={handleFilterChange}
          count={filtered.length}
          total={followers.length}
        />
      </div>

      {/* Table */}
      <FollowerTable
        followers={paged}
        onUnfollow={handleUnfollow}
        loading={loading}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#131929', border: '1px solid #1e2a4a', color: page === 1 ? '#2a3a5a' : '#94a3b8',
              cursor: page === 1 ? 'not-allowed' : 'pointer', transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { if (page > 1) e.currentTarget.style.borderColor = '#3b82f6' }}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#1e2a4a'}
          >
            <ChevronLeft size={16} />
          </button>

          {[...Array(Math.min(totalPages, 7))].map((_, i) => {
            let p = i + 1
            if (totalPages > 7) {
              if (page <= 4) p = i + 1
              else if (page >= totalPages - 3) p = totalPages - 6 + i
              else p = page - 3 + i
            }
            return (
              <button key={p}
                onClick={() => setPage(p)}
                style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: page === p ? '#3b82f6' : '#131929',
                  border: page === p ? '1px solid #3b82f6' : '1px solid #1e2a4a',
                  color: page === p ? '#fff' : '#94a3b8',
                  cursor: 'pointer',
                  fontFamily: 'Space Mono, monospace', fontSize: 13, fontWeight: page === p ? 700 : 400,
                  transition: 'all 0.15s ease',
                  boxShadow: page === p ? '0 0 12px rgba(59,130,246,0.3)' : 'none',
                }}
                onMouseEnter={e => { if (page !== p) e.currentTarget.style.borderColor = '#3b82f6' }}
                onMouseLeave={e => { if (page !== p) e.currentTarget.style.borderColor = '#1e2a4a' }}
              >
                {p}
              </button>
            )
          })}

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{
              width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#131929', border: '1px solid #1e2a4a', color: page === totalPages ? '#2a3a5a' : '#94a3b8',
              cursor: page === totalPages ? 'not-allowed' : 'pointer', transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { if (page < totalPages) e.currentTarget.style.borderColor = '#3b82f6' }}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#1e2a4a'}
          >
            <ChevronRight size={16} />
          </button>

          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: '#475569', marginLeft: 8 }}>
            Page {page} of {totalPages}
          </span>
        </div>
      )}

      {/* Unfollow modal */}
      {unfollowTarget && (
        <ProgressModal
          open={modalOpen}
          userIds={[unfollowTarget.id]}
          users={[unfollowTarget]}
          onUnfollow={unfollow}
          onDone={() => {
            removeFromState([unfollowTarget.id])
            showToast(`Unfollowed @${unfollowTarget.username}`)
          }}
          onClose={() => { setModalOpen(false); setUnfollowTarget(null) }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 2000,
          background: toast.type === 'success' ? '#131929' : '#2d1a1a',
          border: `1px solid ${toast.type === 'success' ? '#22c55e' : '#ef4444'}`,
          borderRadius: 10, padding: '12px 18px',
          color: toast.type === 'success' ? '#22c55e' : '#ef4444',
          fontFamily: 'Space Mono, monospace', fontSize: 13,
          boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
          animation: 'slideInRight 0.3s ease',
        }}>
          {toast.type === 'success' ? '✓ ' : '✗ '}{toast.msg}
        </div>
      )}

      <style>{`
        @keyframes pageFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @media (max-width: 768px) { div[style*="padding: 32px"] { padding: 16px !important; } }
      `}</style>
    </div>
  )
}
