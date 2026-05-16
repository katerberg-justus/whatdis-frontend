import { useQuery } from '@tanstack/react-query'
import { apiClient } from './clients'
import { qk } from './queryKeys'

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

export function usePacksQuery(options = {}) {
  return useQuery({
    queryKey: qk.packs,
    queryFn: apiGetPacks,
    staleTime: 10 * 60 * 1000,
    ...options,
  })
}

export function usePackQuery(packId, options = {}) {
  return useQuery({
    queryKey: qk.pack(packId),
    queryFn: () => apiGetPack(packId),
    enabled: Boolean(packId),
    staleTime: 10 * 60 * 1000,
    ...options,
  })
}

export function usePackChallengesQuery(packId, options = {}) {
  return useQuery({
    queryKey: qk.packChallenges(packId),
    queryFn: () => apiGetPackChallenges(packId),
    enabled: Boolean(packId),
    staleTime: 10 * 60 * 1000,
    ...options,
  })
}

export function useDailyChallengesQuery(options = {}) {
  return useQuery({
    queryKey: qk.daily,
    queryFn: apiGetDailyChallenges,
    staleTime: 10 * 60 * 1000,
    ...options,
  })
}
