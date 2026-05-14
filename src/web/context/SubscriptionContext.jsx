import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { apiMe } from '@shared/api/users'
import { apiStartCheckout, apiCancelSubscription } from '@shared/api/subscriptions'

const SubscriptionContext = createContext(null)

export function SubscriptionProvider({ children }) {
  const { user } = useAuth()
  const userKey = user?.id ?? user?.username ?? null
  // undefined = still loading, null = no subscription
  const [subscription, setSubscription] = useState(undefined)

  const refresh = useCallback(() => {
    if (!userKey) {
      return Promise.resolve(null)
    }

    return apiMe()
      .then(data => setSubscription(data.subscription ?? null))
      .catch(() => setSubscription(null))
  }, [userKey])

  useEffect(() => { refresh() }, [refresh])

  async function startCheckout(planId, currency) {
    const { checkout_url } = await apiStartCheckout(planId, currency)
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
