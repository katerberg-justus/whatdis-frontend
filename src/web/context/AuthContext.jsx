import { createContext, useContext, useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { apiLogin, apiGuestAuth, apiClaimAccount, apiLogout } from '@shared/api/auth'
import { apiMe } from '@shared/api/users'
import { clearCsrfTokens, hasCsrfToken } from '@shared/api/clients'
import { qk } from '@shared/api/queryKeys'

const AuthContext = createContext(null)
const NOTIFICATION_STATUS_KEYS = [
  'notifications.lastDailyChallengeId',
  'notifications.lastChallengeCount',
]

export function AuthProvider({ children }) {
  const qc = useQueryClient()
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  const seed = (data) => {
    if (data) qc.setQueryData(qk.me, data)
  }

  useEffect(() => {
    let cancelled = false
    const finishWithUser = (data) => {
      if (cancelled) return
      localStorage.setItem('user', JSON.stringify(data))
      setUser(data)
      seed(data)
    }
    const startGuestSession = () => apiGuestAuth(navigator.language)
      .then(() => apiMe())
      .then(finishWithUser)

    const stored = localStorage.getItem('user')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed?.id) {
        apiMe()
          .then(finishWithUser)
          .catch(() => {
            localStorage.removeItem('user')
            clearCsrfTokens()
            if (localStorage.getItem('logged_out')) return null
            return startGuestSession()
          })
          .finally(() => {
            if (!cancelled) setLoading(false)
          })
        return () => { cancelled = true }
      }
    }
    // Previously authenticated users should go to login, not get a guest session
    if (localStorage.getItem('logged_out')) { setLoading(false); return () => { cancelled = true } }
    const hasSession = hasCsrfToken()
    if (hasSession) {
      apiMe()
        .then(finishWithUser)
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
      return () => { cancelled = true }
    }
    startGuestSession()
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const persist = (data, username) => {
    const u = data?.user ?? data ?? { username }
    localStorage.removeItem('logged_out')
    localStorage.setItem('user', JSON.stringify(u))
    setUser(u)
    seed(u)
  }

  const login = async (username, password) => {
    qc.clear()
    await apiLogin(username, password)
    persist(await apiMe(), username)
  }

  const register = async (name, email, password, referralCode) => {
    qc.clear()
    if (!user) {
      localStorage.removeItem('logged_out')
      await apiGuestAuth(navigator.language, referralCode)
    }
    const data = await apiClaimAccount(name, email, password, referralCode)
    persist(data, name)
  }

  const logout = async () => {
    setUser(null)
    localStorage.removeItem('user')
    NOTIFICATION_STATUS_KEYS.forEach(key => localStorage.removeItem(key))
    localStorage.setItem('logged_out', '1')
    try { await apiLogout() } catch {
      // The local logout state is authoritative even if the server session is already gone.
    }
    qc.clear()
    window.location.replace('/login')
  }

  if (loading) return null

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
