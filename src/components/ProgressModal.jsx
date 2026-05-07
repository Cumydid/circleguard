import React, { useEffect, useState, useRef } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react'

export default function ProgressModal({ open, userIds, users, onUnfollow, onDone, onClose }) {
  const [step, setStep] = useState('idle') // idle | running | done
  const [index, setIndex] = useState(0)
  const [unfollowed, setUnfollowed] = useState(0)
  const [failed, setFailed] = useState(0)
  const [errors, setErrors] = useState([])
  const [currentUsername, setCurrentUsername] = useState('')
  const cancelRef = useRef(false)

  useEffect(() => {
    if (open && step === 'idle') {
      runUnfollow()
    }
    if (!open) {
      setStep('idle')
      setIndex(0)
      setUnfollowed(0)
      setFailed(0)
      setErrors([])
      cancelRef.current = false
    }
  }, [open])

  const runUnfollow = async () => {
    setStep('running')
    cancelRef.current = false
    let successCount = 0
    let failCount = 0
    const errs = []

    for (let i = 0; i < userIds.length; i++) {
      if (cancelRef.current) break
      const uid = userIds[i]
      const user = users?.find(u => u.id === uid)
      setCurrentUsername(user ? user.username : uid)
      setIndex(i + 1)

      try {
        await onUnfollow([uid])
        successCount++
        setUnfollowed(successCount)
      } catch (e) {
        failCount++
        setFailed(failCount)
        errs.push(`@${user?.username || uid}: Failed`)
        setErrors([...errs])
      }

      // Simulate Twitter rate limit delay
      await new Promise(r => setTimeout(r, 400 + Math.random() * 200))
    }

    setStep('done')
  }

  const progress = userIds.length > 0 ? (index / userIds.length) * 100 : 0

  if (!open) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
      animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{
        background: '#131929',
        border: '1px solid #1e2a4a',
        borderRadius: 16,
        padding: 32,
        width: '100%',
        maxWidth: 480,
        boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
        animation: 'slideUp 0.25s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>
              {step === 'done' ? '✓ Unfollow Complete' : '⚡ Unfollowing...'}
            </h2>
            <p style={{ fontSize: 13, color: '#475569', marginTop: 4, fontFamily: 'Space Mono, monospace' }}>
              {step === 'done' ? `Processed ${userIds.length} accounts` : `Processing ${userIds.length} accounts`}
            </p>
          </div>
          {step === 'done' && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 4, transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#f1f5f9'}
              onMouseLeave={e => e.currentTarget.style.color = '#475569'}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: '#94a3b8' }}>
              {step === 'running' && currentUsername && `Unfollowing @${currentUsername}...`}
              {step === 'done' && 'All done!'}
            </span>
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: '#60a5fa', fontWeight: 700 }}>
              {index} / {userIds.length}
            </span>
          </div>
          <div style={{ height: 8, background: '#1e2a4a', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 8,
              background: step === 'done' ? '#22c55e' : 'linear-gradient(90deg, #1d4ed8, #3b82f6)',
              width: `${progress}%`,
              transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1)',
              boxShadow: step === 'done' ? '0 0 12px rgba(34,197,94,0.5)' : '0 0 12px rgba(59,130,246,0.5)',
            }} />
          </div>
          {step === 'running' && (
            <div style={{ display: 'flex', gap: 3, marginTop: 8, justifyContent: 'center' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: '#3b82f6',
                  animation: `bounce 0.8s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                }} />
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 24, fontWeight: 700, color: '#22c55e' }}>{unfollowed}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, fontFamily: 'Syne, sans-serif' }}>Unfollowed</div>
          </div>
          <div style={{ background: failed > 0 ? 'rgba(239,68,68,0.06)' : '#0f1629', border: failed > 0 ? '1px solid rgba(239,68,68,0.2)' : '1px solid #1e2a4a', borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 24, fontWeight: 700, color: failed > 0 ? '#ef4444' : '#475569' }}>{failed}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, fontFamily: 'Syne, sans-serif' }}>Failed</div>
          </div>
        </div>

        {/* Rate limit warning */}
        <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <AlertTriangle size={15} color="#f59e0b" style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 12, color: '#f59e0b', fontFamily: 'Space Mono, monospace', lineHeight: 1.5 }}>
            Twitter limits unfollows to ~400/day. Pace is throttled to avoid bans.
          </span>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div style={{ maxHeight: 100, overflowY: 'auto', marginBottom: 16 }}>
            {errors.map((err, i) => (
              <div key={i} style={{ fontSize: 12, color: '#ef4444', fontFamily: 'Space Mono, monospace', padding: '3px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertCircle size={11} />
                {err}
              </div>
            ))}
          </div>
        )}

        {/* Done button */}
        {step === 'done' && (
          <button
            onClick={() => { onDone?.(); onClose?.() }}
            style={{
              width: '100%', padding: '12px',
              background: '#22c55e', border: 'none', borderRadius: 10,
              color: '#fff', cursor: 'pointer',
              fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 0 20px rgba(34,197,94,0.3)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#16a34a'}
            onMouseLeave={e => e.currentTarget.style.background = '#22c55e'}
          >
            <CheckCircle size={18} />
            Done — View Results
          </button>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
      `}</style>
    </div>
  )
}
