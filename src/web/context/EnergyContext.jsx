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
const REGISTER_PERKS = [
  { title: 'register.energyPerk',   desc: 'register.energyPerkDesc'   },
  { title: 'register.battlesPerk',  desc: 'register.battlesPerkDesc'  },
  { title: 'register.progressPerk', desc: 'register.progressPerkDesc' },
]

export function EnergyProvider({ children }) {
  const { user } = useAuth()
  const { isActive } = useSubscription()
  const { t } = useLang()
  const navigate = useNavigate()
  const [energy,    setEnergy]    = useState(null)
  const [maxEnergy, setMaxEnergy] = useState(10)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    if (!user) return

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

  const depleteEnergy = (cost = 1) =>
    setEnergy(e => (e !== null && e > 0) ? Math.max(0, e - cost) : e)

  const syncEnergy = (value) =>
    setEnergy(value ?? null)

  const isOutOfEnergy = energy === 0
  const promptOutOfEnergy = useCallback(() => setDialogOpen(true), [])

  const isGuest = !user || user.is_guest
  const showRegister = dialogOpen && isGuest
  const showUpgrade = dialogOpen && !isGuest && !isActive

  return (
    <EnergyContext.Provider value={{ energy, maxEnergy, depleteEnergy, syncEnergy, isOutOfEnergy, promptOutOfEnergy }}>
      {children}
      {showRegister && (
        <Dialog title={t('register.energyTitle')} onClose={() => setDialogOpen(false)}>
          <ul className="upgrade__perks">
            {REGISTER_PERKS.map(({ title, desc }) => (
              <li key={title} className="upgrade__perk">
                <span className="upgrade__perk-bullet" />
                <div className="upgrade__perk-text">
                  <span className="upgrade__perk-title">{t(title)}</span>
                  <span className="upgrade__perk-desc">{t(desc)}</span>
                </div>
              </li>
            ))}
          </ul>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Button color="pink" fullWidth onClick={() => { setDialogOpen(false); navigate('/register') }}>{t('register.submit')}</Button>
            <Button color="blue" fullWidth onClick={() => { setDialogOpen(false); navigate('/login') }}>{t('register.signIn')}</Button>
          </div>
        </Dialog>
      )}
      {showUpgrade && <UpgradeDialog onClose={() => setDialogOpen(false)} />}
    </EnergyContext.Provider>
  )
}

export const useEnergy = () => useContext(EnergyContext)
