import { useState } from 'react'
import { useLang } from '../context/LangContext'
import { useCurrency } from '../context/CurrencyContext'
import { useSubscription } from '../context/SubscriptionContext'
import Dialog from './Dialog'
import Button from './Button'
import RadioButton from './RadioButton'
import './UpgradeDialog.scss'

const PLANS = [
  { id: 'pro_weekly',  key: 'upgrade.weekly',  prices: { EUR: '€0.99',  USD: '$1.19',  GBP: '£0.89'  } },
  { id: 'pro_monthly', key: 'upgrade.monthly', prices: { EUR: '€1.99',  USD: '$2.49',  GBP: '£1.79'  } },
  { id: 'pro_yearly',  key: 'upgrade.yearly',  prices: { EUR: '€19.99', USD: '$24.99', GBP: '£17.99' } },
]

const PERKS = [
  { title: 'upgrade.perk1', desc: 'upgrade.perk1desc' },
  { title: 'upgrade.perk2', desc: 'upgrade.perk2desc' },
  { title: 'upgrade.perk3', desc: 'upgrade.perk3desc' },
]

export default function UpgradeDialog({ onClose, fullscreen = false }) {
  const { t }             = useLang()
  const { currency }      = useCurrency()
  const { startCheckout } = useSubscription()
  const [selected, setSelected] = useState('pro_monthly')
  const [loading,  setLoading]  = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    try { await startCheckout(selected, currency) } catch { setLoading(false) }
  }

  const body = (
    <>
      <ul className="upgrade__perks">
        {PERKS.map(({ title, desc }) => (
          <li key={title} className="upgrade__perk">
            <span className="upgrade__perk-bullet" />
            <div className="upgrade__perk-text">
              <span className="upgrade__perk-title">{t(title)}</span>
              <span className="upgrade__perk-desc">{t(desc)}</span>
            </div>
          </li>
        ))}
      </ul>
      <div className="upgrade__plans">
        {PLANS.map(({ id, key, prices }) => (
          <RadioButton
            key={id}
            name="upgrade-plan"
            value={id}
            checked={selected === id}
            className="upgrade__plan"
            onChange={() => setSelected(id)}
          >
            <span className="upgrade__plan-period">{t(key)}</span>
            <span className="upgrade__plan-price">{prices[currency]}</span>
          </RadioButton>
        ))}
      </div>
      <Button fullWidth disabled={loading} onClick={handleUpgrade}>
        {loading ? t('upgrade.redirecting') : t('upgrade.cta')}
      </Button>
      {fullscreen && (
        <button type="button" className="upgrade__skip" onClick={onClose}>
          {t('upgrade.playForFree')}
        </button>
      )}
    </>
  )

  if (fullscreen) {
    return (
      <div className="upgrade-fullscreen">
        <div className="upgrade-fullscreen__inner">
          <h2 className="upgrade-fullscreen__title">{t('upgrade.title')}</h2>
          {body}
        </div>
      </div>
    )
  }

  return (
    <Dialog title={t('upgrade.title')} onClose={onClose}>
      {body}
    </Dialog>
  )
}
