import { useState } from 'react'
import { useLang } from '../../../context/LangContext'
import { useSubscription } from '../../../context/SubscriptionContext'
import Button from '../../../components/Button'
import './AccountPage.scss'

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

function formatDate(value) {
  if (!value) return ''
  const d = typeof value === 'number' ? new Date(value * 1000) : new Date(value)
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function SubscriptionPage() {
  const { t } = useLang()
  const { subscription, isActive, startCheckout, cancelSubscription } = useSubscription()

  const currentPlan    = PLANS.find(p => p.id === subscription?.plan_id)
  const currentPlanIdx = PLANS.findIndex(p => p.id === subscription?.plan_id)
  const isCancelling   = !!subscription?.cancelled_at

  const [selected,   setSelected]   = useState(subscription?.plan_id ?? 'pro_monthly')
  const [loading,    setLoading]    = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [error,      setError]      = useState(null)

  const handleCheckout = async () => {
    setLoading(true)
    try { await startCheckout(selected) } catch { setLoading(false) }
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
            {currentPlan && ` — ${currentPlan.price}`}
          </span>
          <span className="account__sub-meta">
            {isCancelling
              ? `${t('subscription.cancelsOn')} ${formatDate(subscription.current_period_end)}`
              : `${t('subscription.renewsOn')} ${formatDate(subscription.current_period_end)}`}
          </span>
        </div>
      )}

      {!isActive && (
        <ul className="upgrade__perks">
          {PERKS.map(({ title, desc }) => (
            <li key={title} className="upgrade__perk">
              <span className="upgrade__perk-title">{t(title)}</span>
              <span className="upgrade__perk-desc">{t(desc)}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="upgrade__plans">
        {PLANS.map(({ id, key, price }, idx) => {
          const locked = isActive && idx <= currentPlanIdx
          return (
          <button
            key={id}
            type="button"
            className={['upgrade__plan', selected === id && 'upgrade__plan--active', locked && 'upgrade__plan--locked'].filter(Boolean).join(' ')}
            onClick={() => !locked && setSelected(id)}
          >
            <span className="upgrade__plan-period">{t(key)}</span>
            <span className="upgrade__plan-price">{price}</span>
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
