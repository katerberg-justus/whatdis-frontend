import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './clients'
import { qk } from './queryKeys'

export async function apiGetGames() {
  const { data } = await apiClient.get('/games')
  return Array.isArray(data) ? data : (data.games ?? [])
}

export async function apiGetGame(gameId) {
  const { data } = await apiClient.get(`/games/${gameId}`)
  return data
}

export async function apiGetGuesses(gameId) {
  const { data } = await apiClient.get(`/games/${gameId}/guesses`)
  return Array.isArray(data) ? data : (data.guesses ?? [])
}

export async function apiCreateGame(body) {
  const { data } = await apiClient.post('/games', body)
  return data
}

export async function apiSubmitGuess(gameId, content) {
  const { data } = await apiClient.post(`/games/${gameId}/guesses`, { content })
  return data
}

export async function apiRequestHint(gameId) {
  const { data } = await apiClient.post(`/games/${gameId}/hints`)
  return data
}

export function useGamesQuery(options = {}) {
  return useQuery({
    queryKey: qk.games,
    queryFn: apiGetGames,
    staleTime: 30 * 1000,
    ...options,
  })
}

export function useGameQuery(gameId, options = {}) {
  return useQuery({
    queryKey: qk.game(gameId),
    queryFn: () => apiGetGame(gameId),
    enabled: Boolean(gameId),
    staleTime: 3 * 1000,
    ...options,
  })
}

export function useGuessesQuery(gameId, options = {}) {
  return useQuery({
    queryKey: qk.guesses(gameId),
    queryFn: () => apiGetGuesses(gameId),
    enabled: Boolean(gameId),
    staleTime: 3 * 1000,
    ...options,
  })
}

export function useCreateGameMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: apiCreateGame,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.games })
    },
  })
}

export function useSubmitGuessMutation(gameId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (content) => apiSubmitGuess(gameId, content),
    onSuccess: (guess) => {
      qc.invalidateQueries({ queryKey: qk.guesses(gameId) })
      if (guess?.response === 'win') {
        qc.invalidateQueries({ queryKey: qk.game(gameId) })
        qc.invalidateQueries({ queryKey: qk.games })
      }
      if (guess?.new_achievements?.length) {
        qc.invalidateQueries({ queryKey: qk.myAchievements })
      }
    },
  })
}

export function useRequestHintMutation(gameId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => apiRequestHint(gameId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.guesses(gameId) })
    },
  })
}
