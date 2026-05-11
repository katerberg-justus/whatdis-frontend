import { apiClient } from './clients'

export async function apiGetFriends() {
  const { data } = await apiClient.get('/me/friends')
  return Array.isArray(data) ? data : (data.friends ?? [])
}

export async function apiGetFriendRequests() {
  const { data } = await apiClient.get('/me/friends/requests')
  return Array.isArray(data) ? data : (data.requests ?? [])
}

export async function apiSendFriendInvite(email) {
  const { data } = await apiClient.post('/me/friends', { email })
  return data
}

export async function apiAcceptFriendRequest(friendshipId) {
  const { data } = await apiClient.put(`/me/friends/${friendshipId}`)
  return data
}

export async function apiRemoveFriend(friendshipId) {
  await apiClient.delete(`/me/friends/${friendshipId}`)
}
