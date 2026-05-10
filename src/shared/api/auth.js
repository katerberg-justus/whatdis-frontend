import { authClient, apiClient } from './clients'

export async function apiLogin(username, password) {
  const { data } = await authClient.post('/auth/login', { username, password })
  return data
}

export async function apiRegister(username, password) {
  const { data } = await apiClient.post('/users', { username, password })
  return data
}

export async function apiLogout() {
  await apiClient.post('/auth/logout')
}
