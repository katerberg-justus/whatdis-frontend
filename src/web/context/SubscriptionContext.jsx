import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { apiGetSubscription, apiStartCheckout } from '@shared/api/subscriptions'

const SubscriptionContext = createContext(null)

export function SubscriptionProvider({ children }) {
  const { user } = useAuth()
  // undefined = still loading, null = no subscription
  const [subscription, setSubscription] = useState(undefined)

  useEffect(() => {
    if (!user) { setSubscription(null); return }
    apiGetSubscription()
      .then(setSubscription)
      .catch(() => setSubscription(null))
  }, [user?.id ?? user?.username])

  async function startCheckout(planId) {
    const { checkout_url } = await apiStartCheckout(planId)
    window.location.href = checkout_url
  }

  const isActive = subscription?.status === 'active'

  return (
    <SubscriptionContext.Provider value={{ subscription, isActive, startCheckout }}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export const useSubscription = () => useContext(SubscriptionContext)
