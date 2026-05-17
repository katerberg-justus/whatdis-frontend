import { createContext, useContext, useState, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from './AuthContext'
import { useLang } from './LangContext'
import { useSubscription } from './SubscriptionContext'
import { useMeQuery } from '@shared/api/users'
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
  const [localEnergy, setLocalEnergy] = useState(null)
  const [dialogDismissed, setDialogDismissed] = useState(false)
  const [dialogForcedOpen, setDialogForcedOpen] = useState(false)

  const { data: me } = useMeQuery({
    enabled: Boolean(user),
    refetchOnMount: 'always',
  })

  const source = me ?? user
  const serverEnergy = source?.energy ?? null
  const energy = localEnergy?.serverEnergy === serverEnergy ? localEnergy.value : serverEnergy
  const maxEnergy = source?.max_energy ?? Math.max(10, energy ?? 0)
  const energyBoost = source?.energy_boost ?? 0
  const dialogOpen = energy === 0 && (dialogForcedOpen || !dialogDismissed)

  const depleteEnergy = (cost = 1) => {
    setDialogDismissed(false)
    setLocalEnergy(current => {
      const currentEnergy = current?.serverEnergy === serverEnergy ? current.value : serverEnergy
      const value = (currentEnergy !== null && currentEnergy > 0) ? Math.max(0, currentEnergy - cost) : currentEnergy
      return { serverEnergy, value }
    })
  }

  const syncEnergy = (value) => {
    const next = value ?? null
    setDialogDismissed(false)
    setLocalEnergy({ serverEnergy, value: next })
  }

  const isOutOfEnergy = energy === 0
  const promptOutOfEnergy = useCallback(() => {
    setDialogDismissed(false)
    setDialogForcedOpen(true)
  }, [])
  const closeDialog = () => {
    setDialogDismissed(true)
    setDialogForcedOpen(false)
  }

  const isGuest = !user || user.is_guest
  const showRegister = dialogOpen && isGuest
  const showUpgrade = dialogOpen && !isGuest && !isActive

  return (
    <EnergyContext.Provider value={{ energy, maxEnergy, energyBoost, depleteEnergy, syncEnergy, isOutOfEnergy, promptOutOfEnergy }}>
      {children}
      {showRegister && (
        <Dialog title={t('register.energyTitle')} onClose={closeDialog}>
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
            <Button color="pink" fullWidth onClick={() => { closeDialog(); navigate('/register') }}>{t('register.submit')}</Button>
            <Button color="blue" fullWidth onClick={() => { closeDialog(); navigate('/login') }}>{t('register.signIn')}</Button>
          </div>
        </Dialog>
      )}
      {showUpgrade && <UpgradeDialog onClose={closeDialog} />}
    </EnergyContext.Provider>
  )
}

export const useEnergy = () => useContext(EnergyContext)
