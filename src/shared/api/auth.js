import { useMutation } from '@tanstack/react-query'
import { authClient, apiClient, clearCsrfTokens, getCsrfToken } from './clients'
import { queryClient } from './queryClient'

const REFERRAL_STORAGE_KEY = 'referral_code'

function getReferralCode(explicitCode) {
  if (typeof window === 'undefined') return null
  if (explicitCode) {
    localStorage.setItem(REFERRAL_STORAGE_KEY, explicitCode)
    return explicitCode
  }
  const params = new URLSearchParams(window.location.search)
  const code = params.get('ref') || params.get('referral_code')
  if (code) {
    localStorage.setItem(REFERRAL_STORAGE_KEY, code)
    return code
  }
  return localStorage.getItem(REFERRAL_STORAGE_KEY)
}

export async function apiLogin(username, password) {
  const { data } = await authClient.post('/auth/login', { username, password })
  return data
}

export async function apiGuestAuth(language, referralCode) {
  const code = getReferralCode(referralCode)
  await authClient.post('/auth/guest', {
    ...(language ? { language } : {}),
    ...(code ? { referral_code: code } : {}),
  })
}

export async function apiClaimAccount(name, email, password, referralCode) {
  const code = getReferralCode(referralCode)
  const { data } = await apiClient.post('/me/claim', {
    name,
    email,
    password,
    ...(code ? { referral_code: code } : {}),
  })
  localStorage.removeItem(REFERRAL_STORAGE_KEY)
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
    mutationFn: ({ name, email, password, referralCode }) => apiClaimAccount(name, email, password, referralCode),
    onSuccess: () => {
      queryClient.clear()
    },
  })
}
