import { apiClient } from './clients'

export async function apiGetBattles() {
  const { data } = await apiClient.get('/battles')
  return Array.isArray(data) ? data : (data.battles ?? [])
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

export async function apiSubmitBattleGuess(battleId, content, responseCode) {
  const { data } = await apiClient.post(`/battles/${battleId}/guesses`, {
    content,
    response_code: responseCode,
  })
  return data
}
