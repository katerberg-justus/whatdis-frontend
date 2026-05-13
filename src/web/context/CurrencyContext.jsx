import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const SUPPORTED = ['EUR', 'USD', 'GBP']

function normalize(code) {
  if (!code) return null
  const upper = String(code).toUpperCase()
  return SUPPORTED.includes(upper) ? upper : null
}

const CurrencyContext = createContext(null)

export function CurrencyProvider({ children }) {
  const { user } = useAuth()

  const [currency, setCurrencyState] = useState(() =>
    normalize(localStorage.getItem('currency')) ?? 'EUR'
  )

  useEffect(() => {
    if (user?.currency && !localStorage.getItem('currency')) {
      const code = normalize(user.currency)
      if (code) setCurrencyState(code)
    }
  }, [user?.currency])

  function setCurrency(code) {
    const normalized = normalize(code) ?? 'EUR'
    localStorage.setItem('currency', normalized)
    setCurrencyState(normalized)
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, currencies: SUPPORTED }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export const useCurrency = () => useContext(CurrencyContext)
