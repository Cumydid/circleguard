import React, { useEffect, useState } from 'react'
import { Bot, Shield, Trash2, RefreshCw, AlertTriangle } from 'lucide-react'
import UserCard from '../components/UserCard.jsx'
import ProgressModal from '../components/ProgressModal.jsx'
import { useFollowers } from '../hooks/useFollowers.jsx'

export default function BotsPage() {
  const { bots, loading, fetchBots, unfollow, removeFromState } = useFollowers()
  const [selected, setSelected] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => { fetchBots() }, [])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleSelectAll = () => {
    setSelected(selected.length === bots.length ? [] : bots.map(b => b.id))
  }

  const avgScore = bots.length > 0 ? Math.round(bots.reduce((a, b) => a + b.botScore, 0) / bots.length) : 0

  return (
    <div style={{ padding: 32, animation: 'pageFadeIn 0.4s ease forwards' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px', marginBottom: 6 }}>
          Bot Detection
        </h1>
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: '#475569' }}>
          Accounts with bot score ≥ 60 flagged as suspicious
        </p>
      </div>

      {/* Summary bar */}
      <div style={{
        background: 'rgba(239,68,68,0.06)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: 12, padding: '16px 20px',
        marginBottom: 24,
        display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={20} color="#ef4444" />
          </div>
          <div>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 22, fontWeight: 700, color: '#ef4444' }}>{bots.length}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'Syne, sans-serif' }}>Bots found</div>
          </div>
        </div>

        <div style={{ width: 1, height: 40, background: 'rgba(239,68,68,0.2)' }} />

        <div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 22, fontWeight: 700, color: '#f59e0b' }}>{avgScore}/100</div>
          <div style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'Syne, sans-serif' }}>Avg bot score</div>
        </div>

        <div style={{ width: 1, height: 40, background: 'rgba(239,68,68,0.2)' }} />

        <div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 22, fontWeight: 700, color: '#f1f5f9' }}>{selected.length}</div>
          <div style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'Syne, sans-serif' }}>Selected</div>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={handleSelectAll}
            style={{
              padding: '9px 16px', border: '1px solid #1e2a4a', borderRadius: 8,
              background: '#131929', color: '#94a3b8', cursor: 'pointer',
              fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#60a5fa' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e2a4a'; e.currentTarget.style.color = '#94a3b8' }}
          >
            {selected.length === bots.length ? 'Deselect All' : 'Select All'}
          </button>
          <button
            onClick={() => bots.length > 0 && setModalOpen(true)}
            disabled={bots.length === 0 || loading}
            style={{
              padding: '9px 18px', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 8,
              background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: bots.length === 0 ? 'not-allowed' : 'pointer',
              fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.15s ease', opacity: bots.length === 0 ? 0.5 : 1,
            }}
            onMouseEnter={e => { if (bots.length > 0) { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; e.currentTarget.style.borderColor = '#ef4444' } }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)' }}
          >
            <Trash2 size={15} />
            Unfollow All Bots
          </button>
        </div>
      </div>

      {/* Warning */}
      <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 10, padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
        <AlertTriangle size={14} color="#f59e0b" />
        <span style={{ fontSize: 12, color: '#f59e0b', fontFamily: 'Space Mono, monospace' }}>
          Bot scores are estimated. Always review before mass unfollowing.
        </span>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{ background: '#131929', border: '1px solid #1e2a4a', borderRadius: 12, padding: 20, animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.1}s` }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#1e2a4a' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 14, background: '#1e2a4a', borderRadius: 4, width: '60%', marginBottom: 8 }} />
                  <div style={{ height: 11, background: '#1e2a4a', borderRadius: 4, width: '40%' }} />
                </div>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#1e2a4a' }} />
              </div>
              <div style={{ height: 40, background: '#1e2a4a', borderRadius: 6, marginBottom: 12 }} />
              <div style={{ height: 60, background: '#1e2a4a', borderRadius: 6 }} />
            </div>
          ))}
        </div>
      ) : bots.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Shield size={36} color="#22c55e" />
          </div>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>
            No bots detected!
          </h3>
          <p style={{ fontSize: 14, color: '#475569', maxWidth: 360, margin: '0 auto' }}>
            Your follower base looks clean. No accounts with a bot score ≥ 60 were found.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {bots.map(bot => (
            <UserCard
              key={bot.id}
              user={bot}
              selectable={true}
              selected={selected.includes(bot.id)}
              onSelect={toggleSelect}
            />
          ))}
        </div>
      )}

      {/* Unfollow selected button (sticky) */}
      {selected.length > 0 && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 100, animation: 'slideUp 0.2s ease',
        }}>
          <button
            onClick={() => setModalOpen(true)}
            style={{
              padding: '14px 32px',
              background: '#ef4444', border: 'none', borderRadius: 30,
              color: '#fff', cursor: 'pointer',
              fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 10,
              boxShadow: '0 8px 30px rgba(239,68,68,0.4)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.transform = 'scale(1.02)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.transform = 'scale(1)' }}
          >
            <Trash2 size={18} />
            Unfollow {selected.length} Selected Bot{selected.length !== 1 ? 's' : ''}
          </button>
        </div>
      )}

      {/* Modal */}
      <ProgressModal
        open={modalOpen}
        userIds={selected.length > 0 ? selected : bots.map(b => b.id)}
        users={bots}
        onUnfollow={unfollow}
        onDone={() => {
          const ids = selected.length > 0 ? selected : bots.map(b => b.id)
          removeFromState(ids)
          setSelected([])
          showToast(`Unfollowed ${ids.length} bot accounts`)
        }}
        onClose={() => setModalOpen(false)}
      />

      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 2000,
          background: '#131929', border: '1px solid #22c55e',
          borderRadius: 10, padding: '12px 18px', color: '#22c55e',
          fontFamily: 'Space Mono, monospace', fontSize: 13,
          boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
          animation: 'slideInRight 0.3s ease',
        }}>
          ✓ {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes pageFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes slideUp { from { opacity: 0; transform: translate(-50%, 20px); } to { opacity: 1; transform: translate(-50%, 0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @media (max-width: 768px) { div[style*="padding: 32px"] { padding: 16px !important; } }
      `}</style>
    </div>
  )
}
