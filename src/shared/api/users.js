import { apiClient } from './clients'

export async function apiMe() {
  const { data } = await apiClient.get('/me')
  return data
}

export async function apiUpdateMe(payload) {
  const { data } = await apiClient.patch('/me', payload)
  return data
}

export async function apiChangePassword(currentPassword, newPassword) {
  const { data } = await apiClient.post('/me/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
  })
  return data
}
