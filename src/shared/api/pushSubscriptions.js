import { apiClient } from './clients'

export async function apiGetVapidPublicKey() {
  const { data } = await apiClient.get('/push/vapid-public-key')
  return data
}

export async function apiCreatePushSubscription(subscription) {
  const { data } = await apiClient.post('/me/push-subscriptions', subscription)
  return data
}

export async function apiDeletePushSubscription(endpoint) {
  await apiClient.delete('/me/push-subscriptions', { data: { endpoint } })
}
