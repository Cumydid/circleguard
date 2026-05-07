import React, { useEffect, useState } from 'react'
import { Users, UserCheck, TrendingUp, Bot, UserX } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import StatCard from '../components/StatCard.jsx'
import { useFollowers } from '../hooks/useFollowers.jsx'
import { MOCK_GROWTH_DATA, MOCK_AUDIENCE_QUALITY } from '../utils/mockData.js'

const PAGE_STYLE = {
  animation: 'pageFadeIn 0.4s ease forwards',
}

function RecentFollowerRow({ user }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 16px',
      borderBottom: '1px solid #1e2a4a',
      transition: 'background 0.15s ease',
    }}
    onMouseEnter={e => e.currentTarget.style.background = '#1e2a4a'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {user.profileImageUrl ? (
        <img src={user.profileImageUrl} alt={user.name}
          style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid #1e2a4a', flexShrink: 0 }}
          onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=1e2a4a&color=60a5fa&size=36` }}
        />
      ) : (
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1e2a4a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: 13, fontWeight: 700, fontFamily: 'Syne, sans-serif', flexShrink: 0 }}>
          {(user.username || '?')[0].toUpperCase()}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.name || user.username}
        </div>
        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#60a5fa' }}>@{user.username}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: '#f1f5f9' }}>
          {(user.followersCount || 0).toLocaleString()}
        </div>
        <div style={{ fontSize: 10, color: '#475569', fontFamily: 'Syne, sans-serif' }}>followers</div>
      </div>
      {user.botScore > 60 && (
        <span style={{ padding: '2px 8px', borderRadius: 20, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: 10, fontFamily: 'Space Mono, monospace', whiteSpace: 'nowrap' }}>
          BOT
        </span>
      )}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1e2a4a', border: '1px solid #2a3a5a', borderRadius: 8, padding: '10px 14px' }}>
      <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#60a5fa', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>
        {payload[0].value?.toLocaleString()} followers
      </div>
    </div>
  )
}

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1e2a4a', border: '1px solid #2a3a5a', borderRadius: 8, padding: '8px 12px' }}>
      <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: payload[0].payload.color }}>{payload[0].name}</div>
      <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{payload[0].value} accounts</div>
    </div>
  )
}

export default function DashboardPage() {
  const { stats, loading, fetchStats, followers, fetchFollowers } = useFollowers()
  const [recentFollowers, setRecentFollowers] = useState([])

  useEffect(() => {
    fetchStats()
    fetchFollowers()
  }, [])

  useEffect(() => {
    if (stats?.recentFollowers) setRecentFollowers(stats.recentFollowers)
    else if (followers.length) setRecentFollowers(followers.slice(0, 10))
  }, [stats, followers])

  const totalFollowers = stats?.totalFollowers || 0
  const totalFollowing = stats?.totalFollowing || 0
  const followRatio = totalFollowing > 0 ? (totalFollowers / totalFollowing).toFixed(2) : '—'
  const botPct = stats?.estimatedBotPercent || 0
  const notFollowingBack = stats?.notFollowingBack || 0

  return (
    <div style={{ padding: '32px', ...PAGE_STYLE }}>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px', marginBottom: 6 }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 14, color: '#475569', fontFamily: 'Space Mono, monospace' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard icon={Users} label="Total Followers" value={totalFollowers.toLocaleString()} trend="up" trendValue="+12%" color="#3b82f6" loading={loading} />
        <StatCard icon={UserCheck} label="Total Following" value={totalFollowing.toLocaleString()} color="#60a5fa" loading={loading} />
        <StatCard icon={TrendingUp} label="Follow Ratio" value={followRatio} sub={`${totalFollowers.toLocaleString()} followers`} color="#22c55e" loading={loading} />
        <StatCard icon={Bot} label="Est. Bot %" value={`${botPct}%`} sub="of total audience" color="#ef4444" loading={loading} />
        <StatCard icon={UserX} label="Not Following Back" value={notFollowingBack.toLocaleString()} sub="you follow them" color="#f59e0b" loading={loading} />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }} className="charts-grid">
        {/* Growth chart */}
        <div style={{ background: '#131929', border: '1px solid #1e2a4a', borderRadius: 14, padding: '24px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>Follower Growth</h3>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#475569', marginTop: 3 }}>Last 12 weeks</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 20, padding: '4px 12px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#22c55e' }}>+49% since Nov</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MOCK_GROWTH_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="followerGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2a4a" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 11, fontFamily: 'Space Mono, monospace' }} axisLine={false} tickLine={false} interval={2} />
              <YAxis tick={{ fill: '#475569', fontSize: 11, fontFamily: 'Space Mono, monospace' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="followers" stroke="#3b82f6" strokeWidth={2} fill="url(#followerGradient)" dot={false} activeDot={{ r: 5, fill: '#3b82f6', stroke: '#0f1629', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Audience quality donut */}
        <div style={{ background: '#131929', border: '1px solid #1e2a4a', borderRadius: 14, padding: '24px' }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>Audience Quality</h3>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#475569', marginBottom: 16 }}>Breakdown by type</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={MOCK_AUDIENCE_QUALITY}
                cx="50%" cy="50%"
                innerRadius={45} outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {MOCK_AUDIENCE_QUALITY.map((entry, index) => (
                  <Cell key={index} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {MOCK_AUDIENCE_QUALITY.map(item => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: item.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'Syne, sans-serif' }}>{item.name}</span>
                </div>
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: item.color, fontWeight: 700 }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent followers */}
      <div style={{ background: '#131929', border: '1px solid #1e2a4a', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e2a4a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>Recent Followers</h3>
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#475569' }}>Latest {recentFollowers.length}</span>
        </div>
        {loading ? (
          <div>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: '1px solid #1e2a4a', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.1}s` }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1e2a4a' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 13, background: '#1e2a4a', borderRadius: 4, width: '25%', marginBottom: 6 }} />
                  <div style={{ height: 11, background: '#1e2a4a', borderRadius: 4, width: '15%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          recentFollowers.map(f => <RecentFollowerRow key={f.id} user={f} />)
        )}
      </div>

      <style>{`
        @keyframes pageFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @media (max-width: 900px) { .charts-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 768px) { div[style*="padding: '32px'"] { padding: 16px !important; } }
      `}</style>
    </div>
  )
}
