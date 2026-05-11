import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { apiMe } from '@shared/api/users'

const EnergyContext = createContext(null)

export function EnergyProvider({ children }) {
  const { user } = useAuth()
  const [energy,    setEnergy]    = useState(null)
  const [maxEnergy, setMaxEnergy] = useState(10)

  useEffect(() => {
    if (!user) { setEnergy(null); return }
    apiMe()
      .then(data => {
        const e = data.energy ?? null
        setEnergy(e)
        setMaxEnergy(data.max_energy ?? Math.max(10, e ?? 0))
      })
      .catch(() => {})
  }, [user])

  const depleteEnergy = () =>
    setEnergy(e => (e !== null && e > 0) ? e - 1 : e)

  const syncEnergy = (value) =>
    setEnergy(value ?? null)

  return (
    <EnergyContext.Provider value={{ energy, maxEnergy, depleteEnergy, syncEnergy }}>
      {children}
    </EnergyContext.Provider>
  )
}

export const useEnergy = () => useContext(EnergyContext)
