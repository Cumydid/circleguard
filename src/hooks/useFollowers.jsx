import { useState, useCallback } from 'react'
import axios from 'axios'
import {
  MOCK_FOLLOWERS,
  MOCK_FOLLOWING,
  MOCK_BOTS,
  MOCK_STATS
} from '../utils/mockData.js'

export function useFollowers() {
  const [followers, setFollowers] = useState([])
  const [following, setFollowing] = useState([])
  const [bots, setBots] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const withMockFallback = async (apiCall, mockData, setter) => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiCall()
      setter(res.data.data)
    } catch {
      // Use mock data in demo mode
      await new Promise(r => setTimeout(r, 600 + Math.random() * 400))
      setter(mockData)
    } finally {
      setLoading(false)
    }
  }

  const fetchFollowers = useCallback(async () => {
    await withMockFallback(
      () => axios.get('/api/followers'),
      MOCK_FOLLOWERS,
      (data) => setFollowers(data.followers || data)
    )
  }, [])

  const fetchFollowing = useCallback(async () => {
    await withMockFallback(
      () => axios.get('/api/following'),
      MOCK_FOLLOWING,
      (data) => setFollowing(data.following || data)
    )
  }, [])

  const fetchBots = useCallback(async () => {
    await withMockFallback(
      () => axios.get('/api/followers/bots'),
      MOCK_BOTS,
      (data) => setBots(data.bots || data)
    )
  }, [])

  const fetchStats = useCallback(async () => {
    await withMockFallback(
      () => axios.get('/api/followers/stats'),
      MOCK_STATS,
      (data) => setStats(data)
    )
  }, [])

  const unfollow = useCallback(async (userIds) => {
    try {
      const res = await axios.post('/api/unfollow', { userIds })
      return res.data.data
    } catch {
      // Demo mode: simulate unfollow
      await new Promise(r => setTimeout(r, 300))
      return { unfollowed: userIds.length, failed: 0, errors: [] }
    }
  }, [])

  const removeFromState = useCallback((userIds) => {
    setFollowers(prev => prev.filter(f => !userIds.includes(f.id)))
    setFollowing(prev => prev.filter(f => !userIds.includes(f.id)))
    setBots(prev => prev.filter(f => !userIds.includes(f.id)))
  }, [])

  return {
    followers,
    following,
    bots,
    stats,
    loading,
    error,
    fetchFollowers,
    fetchFollowing,
    fetchBots,
    fetchStats,
    unfollow,
    removeFromState
  }
}
