import { apiClient } from './clients'

export async function apiGetPacks() {
  const { data } = await apiClient.get('/challenge-packs')
  return Array.isArray(data) ? data : (data.packs ?? [])
}

export async function apiGetPack(packId) {
  const { data } = await apiClient.get(`/challenge-packs/${packId}`)
  return data
}

export async function apiGetPackChallenges(packId) {
  const { data } = await apiClient.get(`/challenge-packs/${packId}/challenges`)
  return Array.isArray(data) ? data : (data.challenges ?? [])
}

export async function apiGetDailyChallenges() {
  const { data } = await apiClient.get('/daily')
  return Array.isArray(data) ? data : (data.challenges ?? data.daily_challenges ?? [])
}
