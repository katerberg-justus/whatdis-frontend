import { apiClient } from './clients'

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
