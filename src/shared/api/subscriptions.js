import { apiClient } from './clients'

export async function apiGetSubscription() {
  const { data } = await apiClient.get('/me/subscription')
  return data?.subscription !== undefined ? data.subscription : data
}

export async function apiStartCheckout(planId) {
  const { data } = await apiClient.post('/subscriptions/checkout', {
    plan_id:     planId,
    success_url: `${window.location.origin}/account/subscription`,
    cancel_url:  `${window.location.origin}/account/subscription`,
  })
  return data
}

export async function apiCancelSubscription() {
  await apiClient.delete('/me/subscription')
}
