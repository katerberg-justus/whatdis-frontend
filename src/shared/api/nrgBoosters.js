import { useMutation, useQuery } from '@tanstack/react-query'
import { apiClient } from './clients'
import { qk } from './queryKeys'

export async function apiGetNrgBoosters() {
  const { data } = await apiClient.get('/nrg-boosters')
  return data
}

export async function apiStartNrgBoosterCheckout(boosterId, currency) {
  const { data } = await apiClient.post('/nrg-boosters/checkout', {
    booster_id: boosterId,
    currency,
    success_url: window.location.href,
    cancel_url:  window.location.href,
  })
  return data
}

export function useNrgBoostersQuery(options = {}) {
  return useQuery({
    queryKey: qk.nrgBoosters,
    queryFn: apiGetNrgBoosters,
    staleTime: 10 * 60 * 1000,
    ...options,
  })
}

export function useStartNrgBoosterCheckoutMutation() {
  return useMutation({
    mutationFn: ({ boosterId, currency }) => apiStartNrgBoosterCheckout(boosterId, currency),
  })
}
