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
  const match = document.cookie.match(/(?:^|;\s*)csrf_access_token=([^;]*)/)
  const csrf = match ? decodeURIComponent(match[1]) : null
  await authClient.delete('/auth/logout', {
    headers: csrf ? { 'X-CSRF-TOKEN': csrf } : {},
  })
}
