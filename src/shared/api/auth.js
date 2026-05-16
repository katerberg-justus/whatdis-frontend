import { useMutation } from '@tanstack/react-query'
import { authClient, apiClient, clearCsrfTokens, getCsrfToken } from './clients'
import { queryClient } from './queryClient'

export async function apiLogin(username, password) {
  const { data } = await authClient.post('/auth/login', { username, password })
  return data
}

export async function apiGuestAuth(language) {
  await authClient.post('/auth/guest', language ? { language } : {})
}

export async function apiClaimAccount(name, email, password) {
  const { data } = await apiClient.post('/me/claim', { name, email, password })
  return data
}

export async function apiLogout() {
  const csrf = getCsrfToken()
  try {
    await authClient.delete('/auth/logout', {
      headers: csrf ? { 'X-CSRF-TOKEN': csrf } : {},
    })
  } finally {
    clearCsrfTokens()
  }
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: ({ username, password }) => apiLogin(username, password),
    onSuccess: () => {
      queryClient.clear()
    },
  })
}

export function useLogoutMutation() {
  return useMutation({
    mutationFn: apiLogout,
    onSettled: () => {
      queryClient.clear()
    },
  })
}

export function useClaimAccountMutation() {
  return useMutation({
    mutationFn: ({ name, email, password }) => apiClaimAccount(name, email, password),
    onSuccess: () => {
      queryClient.clear()
    },
  })
}
