import { apiClient } from './clients'

export async function apiGetBattles() {
  const { data } = await apiClient.get('/battles')
  return Array.isArray(data) ? data : (data.battles ?? [])
}

export async function apiAcceptBattle(battleId) {
  const { data } = await apiClient.post(`/battles/${battleId}/accept`)
  return data
}

export async function apiDeclineBattle(battleId) {
  await apiClient.delete(`/battles/${battleId}`)
}
