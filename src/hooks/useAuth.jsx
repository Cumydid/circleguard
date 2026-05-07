import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import axios from 'axios'
import { MOCK_ME } from '../utils/mockData.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get('/api/auth/me')
        if (res.data.success) {
          setUser(res.data.data)
        } else {
          setUser(null)
        }
      } catch {
        // API not available — use demo mode with mock user from localStorage
        const demoUser = localStorage.getItem('flockwatch_demo_user')
        if (demoUser) {
          try { setUser(JSON.parse(demoUser)) } catch { setUser(null) }
        } else {
          setUser(null)
        }
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  const login = useCallback(() => {
    // In demo mode (no real backend), simulate login with mock user
    const tryRealOAuth = async () => {
      try {
        window.location.href = '/api/auth/twitter'
      } catch {
        // Fallback: demo mode
        setUser(MOCK_ME)
        localStorage.setItem('flockwatch_demo_user', JSON.stringify(MOCK_ME))
        window.location.hash = '#/dashboard'
      }
    }
    // Demo mode: set mock user directly
    setUser(MOCK_ME)
    localStorage.setItem('flockwatch_demo_user', JSON.stringify(MOCK_ME))
    window.location.hash = '#/dashboard'
  }, [])

  const logout = useCallback(async () => {
    try {
      await axios.delete('/api/auth/logout')
    } catch {
      // ignore
    }
    localStorage.removeItem('flockwatch_demo_user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
