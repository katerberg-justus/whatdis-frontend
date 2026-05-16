import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './clients'
import { qk } from './queryKeys'

export async function apiGetSubscription() {
  const { data } = await apiClient.get('/me/subscription')
  return data?.subscription !== undefined ? data.subscription : data
}

function stripeReturnUrl(success) {
  const url = new URL('/account/subscription', window.location.origin)
  url.searchParams.set('success', success ? 'true' : 'false')
  url.searchParams.set('purchase', 'subscription')
  return url.toString()
}

export async function apiStartCheckout(planId, currency) {
  const { data } = await apiClient.post('/subscriptions/checkout', {
    plan_id:     planId,
    currency,
    success_url: stripeReturnUrl(true),
    cancel_url:  stripeReturnUrl(false),
  })
  return data
}

export async function apiCancelSubscription() {
  await apiClient.delete('/me/subscription')
}

export function useSubscriptionQuery(options = {}) {
  return useQuery({
    queryKey: qk.subscription,
    queryFn: apiGetSubscription,
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

export function useStartCheckoutMutation() {
  return useMutation({
    mutationFn: ({ planId, currency }) => apiStartCheckout(planId, currency),
  })
}

export function useCancelSubscriptionMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: apiCancelSubscription,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.subscription })
      qc.invalidateQueries({ queryKey: qk.me })
    },
  })
}
