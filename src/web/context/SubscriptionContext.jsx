import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { apiGetSubscription, apiStartCheckout, apiCancelSubscription } from '@shared/api/subscriptions'

const SubscriptionContext = createContext(null)

export function SubscriptionProvider({ children }) {
  const { user } = useAuth()
  // undefined = still loading, null = no subscription
  const [subscription, setSubscription] = useState(undefined)

  const refresh = useCallback(() => {
    if (!user) { setSubscription(null); return }
    apiGetSubscription()
      .then(setSubscription)
      .catch(() => setSubscription(null))
  }, [user?.id ?? user?.username])

  useEffect(() => { refresh() }, [refresh])

  async function startCheckout(planId) {
    const { checkout_url } = await apiStartCheckout(planId)
    window.location.href = checkout_url
  }

  async function cancelSubscription() {
    await apiCancelSubscription()
    await refresh()
  }

  const isActive = subscription?.status === 'active'

  return (
    <SubscriptionContext.Provider value={{ subscription, isActive, startCheckout, cancelSubscription, refreshSubscription: refresh }}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export const useSubscription = () => useContext(SubscriptionContext)
