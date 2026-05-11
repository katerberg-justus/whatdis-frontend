import { apiClient } from './clients'

export async function apiGetAchievements() {
  const { data } = await apiClient.get('/achievements')
  return Array.isArray(data) ? data : data.achievements ?? []
}

export async function apiGetMyAchievements() {
  const { data } = await apiClient.get('/me/achievements')
  return Array.isArray(data) ? data : data.achievements ?? []
}
