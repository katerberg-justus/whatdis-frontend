import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from './AuthContext'
import { useLang } from './LangContext'
import { useSubscription } from './SubscriptionContext'
import { apiMe } from '@shared/api/users'
import Dialog from '../components/Dialog'
import Button from '../components/Button'
import UpgradeDialog from '../components/UpgradeDialog'

const EnergyContext = createContext(null)

export function EnergyProvider({ children }) {
  const { user } = useAuth()
  const { isActive } = useSubscription()
  const { t } = useLang()
  const navigate = useNavigate()
  const [energy,    setEnergy]    = useState(null)
  const [maxEnergy, setMaxEnergy] = useState(10)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    apiMe()
      .then(data => {
        const e = data.energy ?? null
        setEnergy(e)
        setMaxEnergy(data.max_energy ?? Math.max(10, e ?? 0))
      })
      .catch(() => {})
  }, [user])

  useEffect(() => {
    if (energy === 0) setDialogOpen(true)
  }, [energy])

  const depleteEnergy = () =>
    setEnergy(e => (e !== null && e > 0) ? e - 1 : e)

  const syncEnergy = (value) =>
    setEnergy(value ?? null)

  const isOutOfEnergy = energy === 0
  const promptOutOfEnergy = useCallback(() => setDialogOpen(true), [])

  const showUpgrade = dialogOpen && !!user && !isActive
  const showLogin = dialogOpen && !user

  return (
    <EnergyContext.Provider value={{ energy, maxEnergy, depleteEnergy, syncEnergy, isOutOfEnergy, promptOutOfEnergy }}>
      {children}
      {showLogin && (
        <Dialog title={t('battles.outOfEnergy')} onClose={() => setDialogOpen(false)}>
          <p>{t('challenges.lockedMessage')}</p>
          <Button color="blue" fullWidth onClick={() => { setDialogOpen(false); navigate('/login') }}>{t('register.signIn')}</Button>
          <Button color="pink" fullWidth onClick={() => { setDialogOpen(false); navigate('/register') }}>{t('login.register')}</Button>
        </Dialog>
      )}
      {showUpgrade && <UpgradeDialog onClose={() => setDialogOpen(false)} />}
    </EnergyContext.Provider>
  )
}

export const useEnergy = () => useContext(EnergyContext)
