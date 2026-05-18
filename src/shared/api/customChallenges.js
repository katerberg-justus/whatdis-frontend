import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './clients'
import { qk } from './queryKeys'

export async function apiGetMyCustomChallenges() {
  const { data } = await apiClient.get('/me/custom-challenges')
  return Array.isArray(data) ? data : (data.challenges ?? [])
}

export async function apiGetCustomChallenges() {
  const { data } = await apiClient.get('/custom-challenges')
  return Array.isArray(data) ? data : (data.challenges ?? [])
}

export async function apiCreateCustomChallenge(body) {
  const { data } = await apiClient.post('/me/custom-challenges', body)
  return data
}

export async function apiDeleteCustomChallenge(challengeId) {
  await apiClient.delete(`/me/custom-challenges/${challengeId}`)
}

export async function apiRedeemCustomChallenge(token) {
  const { data } = await apiClient.post('/custom-challenges/redeem', { token })
  return data
}

export function useMyCustomChallengesQuery(options = {}) {
  return useQuery({
    queryKey: qk.myCustomChallenges,
    queryFn: apiGetMyCustomChallenges,
    staleTime: 30 * 1000,
    ...options,
  })
}

export function useCustomChallengesQuery(options = {}) {
  return useQuery({
    queryKey: qk.customChallenges,
    queryFn: apiGetCustomChallenges,
    staleTime: 30 * 1000,
    ...options,
  })
}

export function useCreateCustomChallengeMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: apiCreateCustomChallenge,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.myCustomChallenges })
      qc.invalidateQueries({ queryKey: qk.customChallenges })
    },
  })
}

export function useDeleteCustomChallengeMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: apiDeleteCustomChallenge,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.myCustomChallenges })
      qc.invalidateQueries({ queryKey: qk.customChallenges })
    },
  })
}
