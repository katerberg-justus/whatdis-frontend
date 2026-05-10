import { createContext, useContext, useState, useEffect } from 'react'
import { apiLogin, apiRegister, apiLogout } from '@shared/api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) setUser(JSON.parse(stored))
    setLoading(false)
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

  const register = async (username, password) => {
    await apiRegister(username, password)
    await login(username, password)
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
