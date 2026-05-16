import { useEffect, useRef, useState } from 'react'
import { useLang } from '../../../context/LangContext'
import { useCurrency } from '../../../context/CurrencyContext'
import { useSubscription } from '../../../context/SubscriptionContext'
import Button from '../../../components/Button'
import { useDateLocale } from '../../../hooks/useDateLocale'
import { formatLocalizedDate } from '../../../utils/dateFormat'
import './AccountPage.scss'

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

export default function SubscriptionPage() {
  const { t } = useLang()
  const dateLocale = useDateLocale()
  const { currency } = useCurrency()
  const { subscription, isActive, startCheckout, cancelSubscription } = useSubscription()

  const currentPlan    = PLANS.find(p => p.id === subscription?.plan_id)
  const currentPlanIdx = PLANS.findIndex(p => p.id === subscription?.plan_id)
  const isCancelling   = !!subscription?.cancelled_at

  const [selected,   setSelected]   = useState(subscription?.plan_id ?? 'pro_monthly')
  const [loading,    setLoading]    = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [error,      setError]      = useState(null)
  const userSelectedPlan = useRef(false)

  useEffect(() => {
    if (!userSelectedPlan.current && subscription?.plan_id) {
      setSelected(subscription.plan_id)
    }
  }, [subscription?.plan_id])

  const handleCheckout = async () => {
    setLoading(true)
    try { await startCheckout(selected, currency) } catch { setLoading(false) }
  }

  const handleCancel = async () => {
    setLoading(true)
    setError(null)
    try {
      await cancelSubscription()
      setConfirming(false)
    } catch {
      setError(t('subscription.cancelError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="account__section">
      <h2 className="account__heading">{t('subscription.title')}</h2>

      {isActive && (
        <div className="account__sub-status">
          <span className="account__sub-plan">
            {currentPlan ? t(currentPlan.key) : subscription.plan_id}
            {currentPlan && ` — ${currentPlan.prices[currency]}`}
          </span>
          <span className="account__sub-meta">
            {isCancelling
              ? `${t('subscription.cancelsOn')} ${formatLocalizedDate(subscription.current_period_end, dateLocale)}`
              : `${t('subscription.renewsOn')} ${formatLocalizedDate(subscription.current_period_end, dateLocale)}`}
          </span>
        </div>
      )}

      {!isActive && (
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
      )}

      <div className="upgrade__plans">
        {PLANS.map(({ id, key, prices }, idx) => {
          const locked = isActive && idx <= currentPlanIdx
          return (
          <button
            key={id}
            type="button"
            className={['upgrade__plan', selected === id && 'upgrade__plan--active', locked && 'upgrade__plan--locked'].filter(Boolean).join(' ')}
            onClick={() => {
              if (!locked) {
                userSelectedPlan.current = true
                setSelected(id)
              }
            }}
          >
            <span className="upgrade__plan-period">{t(key)}</span>
            <span className="upgrade__plan-price">{prices[currency]}</span>
          </button>
          )
        })}
      </div>

      <Button fullWidth disabled={loading} onClick={handleCheckout}>
        {loading ? t('upgrade.redirecting') : isActive ? t('subscription.changePlan') : t('upgrade.cta')}
      </Button>

      {isActive && !isCancelling && (
        <>
          <div className="account__divider" />
          {error && <p className="account__error">{error}</p>}
          {!confirming ? (
            <Button color="muted" fullWidth onClick={() => setConfirming(true)}>
              {t('subscription.cancel')}
            </Button>
          ) : (
            <div className="account__sub-confirm">
              <p className="account__sub-confirm-msg">{t('subscription.confirmCancel')}</p>
              <div className="account__sub-confirm-actions">
                <Button color="pink" fullWidth disabled={loading} onClick={handleCancel}>
                  {loading ? t('subscription.cancelling') : t('subscription.confirmYes')}
                </Button>
                <Button color="muted" fullWidth onClick={() => setConfirming(false)}>
                  {t('subscription.keepIt')}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
