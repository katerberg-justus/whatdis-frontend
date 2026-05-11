import { useState } from 'react'
import { useLang } from '../context/LangContext'
import { useSubscription } from '../context/SubscriptionContext'
import Dialog from './Dialog'
import Button from './Button'
import './UpgradeDialog.scss'

const PLANS = [
  { id: 'pro_weekly',  key: 'upgrade.weekly',  price: '€0.99'  },
  { id: 'pro_monthly', key: 'upgrade.monthly', price: '€1.99'  },
  { id: 'pro_yearly',  key: 'upgrade.yearly',  price: '€19.99' },
]

const PERKS = [
  { title: 'upgrade.perk1', desc: 'upgrade.perk1desc' },
  { title: 'upgrade.perk2', desc: 'upgrade.perk2desc' },
  { title: 'upgrade.perk3', desc: 'upgrade.perk3desc' },
]

export default function UpgradeDialog({ onClose }) {
  const { t }             = useLang()
  const { startCheckout } = useSubscription()
  const [selected, setSelected] = useState('pro_monthly')
  const [loading,  setLoading]  = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    try { await startCheckout(selected) } catch { setLoading(false) }
  }

  return (
    <Dialog title={t('upgrade.title')} onClose={onClose}>
      <ul className="upgrade__perks">
        {PERKS.map(({ title, desc }) => (
          <li key={title} className="upgrade__perk">
            <span className="upgrade__perk-title">{t(title)}</span>
            <span className="upgrade__perk-desc">{t(desc)}</span>
          </li>
        ))}
      </ul>
      <div className="upgrade__plans">
        {PLANS.map(({ id, key, price }) => (
          <button
            key={id}
            type="button"
            className={['upgrade__plan', selected === id && 'upgrade__plan--active'].filter(Boolean).join(' ')}
            onClick={() => setSelected(id)}
          >
            <span className="upgrade__plan-period">{t(key)}</span>
            <span className="upgrade__plan-price">{price}</span>
          </button>
        ))}
      </div>
      <Button fullWidth disabled={loading} onClick={handleUpgrade}>
        {loading ? t('upgrade.redirecting') : t('upgrade.cta')}
      </Button>
    </Dialog>
  )
}
