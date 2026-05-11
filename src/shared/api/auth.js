import { authClient, apiClient } from './clients'

export async function apiLogin(username, password) {
  const { data } = await authClient.post('/auth/login', { username, password })
  return data
}

export async function apiGuestAuth() {
  await authClient.post('/auth/guest')
}

export async function apiClaimAccount(name, email, password) {
  const { data } = await apiClient.post('/me/claim', { name, email, password })
  return data
}

export async function apiLogout() {
  await apiClient.delete('/auth/logout')
}
