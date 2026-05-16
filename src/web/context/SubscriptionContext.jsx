import { createContext, useContext } from 'react'
import { useAuth } from './AuthContext'
import { useMeQuery } from '@shared/api/users'
import { useStartCheckoutMutation, useCancelSubscriptionMutation } from '@shared/api/subscriptions'

const SubscriptionContext = createContext(null)

export function SubscriptionProvider({ children }) {
  const { user } = useAuth()

  const { data: me, isLoading, refetch } = useMeQuery({
    enabled: Boolean(user),
  })

  // undefined = still loading, null = no subscription
  const subscription = !user || isLoading ? undefined : (me?.subscription ?? null)

  const startCheckoutMutation = useStartCheckoutMutation()
  const cancelMutation = useCancelSubscriptionMutation()

  async function startCheckout(planId, currency) {
    const { checkout_url } = await startCheckoutMutation.mutateAsync({ planId, currency })
    window.location.href = checkout_url
  }

  async function cancelSubscription() {
    await cancelMutation.mutateAsync()
    await refetch()
  }

  const isActive = subscription?.status === 'active'

  return (
    <SubscriptionContext.Provider value={{ subscription, isActive, startCheckout, cancelSubscription, refreshSubscription: refetch }}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export const useSubscription = () => useContext(SubscriptionContext)
