import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './clients'
import { qk } from './queryKeys'

export async function apiCreateBattle(payload) {
  const { data } = await apiClient.post('/battles', payload)
  return data
}

export async function apiGetBattles(params) {
  const { data } = await apiClient.get('/battles', { params })
  return Array.isArray(data) ? data : (data.battles ?? [])
}

export async function apiGetBattlePackChallenges(packId, opponentId) {
  const { data } = await apiClient.get(`/battles/challenge-packs/${packId}/challenges`, {
    params: { opponent_id: opponentId },
  })
  return Array.isArray(data) ? data : (data.challenges ?? [])
}

export async function apiGetBattle(battleId) {
  const { data } = await apiClient.get(`/battles/${battleId}`)
  return data
}

export async function apiAcceptBattle(battleId) {
  const { data } = await apiClient.put(`/battles/${battleId}/accept`)
  return data
}

export async function apiDeclineBattle(battleId) {
  await apiClient.delete(`/battles/${battleId}`)
}

export async function apiSubmitBattleGuess(battleId, content) {
  const { data } = await apiClient.post(`/battles/${battleId}/guesses`, {
    content,
  })
  return data
}

export function useBattlesQuery(options = {}) {
  const { params, ...queryOptions } = options
  return useQuery({
    queryKey: params ? [...qk.battles, params] : qk.battles,
    queryFn: () => apiGetBattles(params),
    staleTime: 10 * 1000,
    ...queryOptions,
  })
}

export function useBattleQuery(battleId, options = {}) {
  return useQuery({
    queryKey: qk.battle(battleId),
    queryFn: () => apiGetBattle(battleId),
    enabled: Boolean(battleId),
    staleTime: 5 * 1000,
    ...options,
  })
}

export function useBattlePackChallengesQuery(packId, opponentId, options = {}) {
  return useQuery({
    queryKey: qk.battlePackChallenges(packId, opponentId),
    queryFn: () => apiGetBattlePackChallenges(packId, opponentId),
    enabled: Boolean(packId && opponentId),
    staleTime: 30 * 1000,
    ...options,
  })
}

export function useCreateBattleMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: apiCreateBattle,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.battles })
    },
  })
}

export function useAcceptBattleMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: apiAcceptBattle,
    onSuccess: (_data, battleId) => {
      qc.invalidateQueries({ queryKey: qk.battles })
      qc.invalidateQueries({ queryKey: qk.battle(battleId) })
    },
  })
}

export function useDeclineBattleMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: apiDeclineBattle,
    onSuccess: (_data, battleId) => {
      qc.invalidateQueries({ queryKey: qk.battles })
      qc.removeQueries({ queryKey: qk.battle(battleId) })
    },
  })
}

export function useSubmitBattleGuessMutation(battleId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (content) => apiSubmitBattleGuess(battleId, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.battle(battleId) })
      qc.invalidateQueries({ queryKey: qk.battles })
      qc.invalidateQueries({ queryKey: qk.myAchievements })
    },
  })
}
