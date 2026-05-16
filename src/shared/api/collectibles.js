import { useQuery } from '@tanstack/react-query'
import { apiClient } from './clients'
import { qk } from './queryKeys'

export async function apiGetAchievements() {
  const { data } = await apiClient.get('/achievements')
  return Array.isArray(data) ? data : data.achievements ?? []
}

export async function apiGetMyAchievements() {
  const { data } = await apiClient.get('/me/achievements')
  return Array.isArray(data) ? data : data.achievements ?? []
}

export function useAchievementsQuery(options = {}) {
  return useQuery({
    queryKey: qk.achievements,
    queryFn: apiGetAchievements,
    staleTime: 60 * 60 * 1000,
    ...options,
  })
}

export function useMyAchievementsQuery(options = {}) {
  return useQuery({
    queryKey: qk.myAchievements,
    queryFn: apiGetMyAchievements,
    staleTime: 60 * 1000,
    ...options,
  })
}
