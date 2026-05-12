import { createContext, useContext, useState, useEffect } from 'react'
import { apiLogin, apiGuestAuth, apiClaimAccount, apiLogout } from '@shared/api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      setUser(JSON.parse(stored))
      setLoading(false)
      return
    }
    // No logged-in user — establish a guest session only if one doesn't already exist
    const hasSession = document.cookie.match(/(?:^|;\s*)csrf_access_token=/)
    if (hasSession) { setLoading(false); return }
    apiGuestAuth().catch(() => {}).finally(() => setLoading(false))
  }, [])

  const persist = (data, username) => {
    const u = data?.user ?? { username }
    localStorage.setItem('user', JSON.stringify(u))
    setUser(u)
  }

  const login = async (username, password) => {
    const data = await apiLogin(username, password)
    persist(data, username)
  }

  const register = async (name, email, password) => {
    await apiClaimAccount(name, email, password)
    await login(name, password)
  }

  const logout = async () => {
    try { await apiLogout() } catch {}
    localStorage.removeItem('user')
    setUser(null)
  }

  if (loading) return null

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
