import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './clients'
import { qk } from './queryKeys'

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

export function useFriendsQuery(options = {}) {
  return useQuery({
    queryKey: qk.friends,
    queryFn: apiGetFriends,
    staleTime: 25 * 1000,
    ...options,
  })
}

export function useFriendRequestsQuery(options = {}) {
  return useQuery({
    queryKey: qk.friendRequests,
    queryFn: apiGetFriendRequests,
    staleTime: 25 * 1000,
    ...options,
  })
}

function invalidateFriends(qc) {
  qc.invalidateQueries({ queryKey: qk.friends })
  qc.invalidateQueries({ queryKey: qk.friendRequests })
}

export function useSendFriendInviteMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: apiSendFriendInvite,
    onSuccess: () => invalidateFriends(qc),
  })
}

export function useAcceptFriendRequestMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: apiAcceptFriendRequest,
    onSuccess: () => invalidateFriends(qc),
  })
}

export function useRemoveFriendMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: apiRemoveFriend,
    onSuccess: () => invalidateFriends(qc),
  })
}
