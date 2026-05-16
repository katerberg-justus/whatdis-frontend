import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './clients'
import { qk } from './queryKeys'

export async function apiMe() {
  const { data } = await apiClient.get('/me')
  return data
}

export async function apiUpdateMe(payload) {
  const { data } = await apiClient.patch('/me', payload)
  return data
}

export async function apiCheckUserAvailability({ name, email } = {}) {
  const params = {}
  if (name) params.name = name
  if (email) params.email = email
  const { data } = await apiClient.get('/users/check', { params })
  return data
}

export async function apiChangePassword(currentPassword, newPassword) {
  const { data } = await apiClient.post('/me/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
  })
  return data
}

export function useMeQuery(options = {}) {
  return useQuery({
    queryKey: qk.me,
    queryFn: apiMe,
    staleTime: 60 * 1000,
    ...options,
  })
}

export function useUpdateMeMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: apiUpdateMe,
    onSuccess: (data) => {
      qc.setQueryData(qk.me, data)
      qc.invalidateQueries({ queryKey: qk.subscription })
    },
  })
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }) =>
      apiChangePassword(currentPassword, newPassword),
  })
}
