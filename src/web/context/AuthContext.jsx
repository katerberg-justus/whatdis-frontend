import { createContext, useContext, useState, useEffect } from 'react'
import { apiLogin, apiGuestAuth, apiClaimAccount, apiLogout } from '@shared/api/auth'
import { apiMe } from '@shared/api/users'

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
    // Previously authenticated users should go to login, not get a guest session
    if (localStorage.getItem('logged_out')) { setLoading(false); return }
    const hasSession = document.cookie.match(/(?:^|;\s*)csrf_access_token=/)
    if (hasSession) {
      apiMe()
        .then(data => { localStorage.setItem('user', JSON.stringify(data)); setUser(data) })
        .catch(() => {})
        .finally(() => setLoading(false))
      return
    }
    apiGuestAuth().catch(() => {}).finally(() => setLoading(false))
  }, [])

  const persist = (data, username) => {
    const u = data?.user ?? { username }
    localStorage.removeItem('logged_out')
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
    localStorage.setItem('logged_out', '1')
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
