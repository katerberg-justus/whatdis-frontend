import { QueryClient, dehydrate, hydrate } from '@tanstack/react-query'

const CHALLENGE_CACHE_KEY = 'whatdis.challengeQueryCache.v1'
const CHALLENGE_CACHE_MAX_AGE = 1000 * 60 * 60 * 24
const CHALLENGE_QUERY_GC_TIME = 1000 * 60 * 60 * 24

function canUseLocalStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function isPersistableChallengeQuery(query) {
  const [scope] = query.queryKey
  return scope === 'challenge-packs' ||
    scope === 'challenge-pack' ||
    scope === 'daily'
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: false,
    },
    mutations: {
      retry: 0,
    },
  },
})

queryClient.setQueryDefaults(['challenge-packs'], { gcTime: CHALLENGE_QUERY_GC_TIME })
queryClient.setQueryDefaults(['challenge-pack'], { gcTime: CHALLENGE_QUERY_GC_TIME })
queryClient.setQueryDefaults(['daily'], { gcTime: CHALLENGE_QUERY_GC_TIME })

if (canUseLocalStorage()) {
  try {
    const cached = JSON.parse(localStorage.getItem(CHALLENGE_CACHE_KEY) || 'null')
    if (cached?.timestamp && cached?.clientState && Date.now() - cached.timestamp <= CHALLENGE_CACHE_MAX_AGE) {
      hydrate(queryClient, cached.clientState)
    } else {
      localStorage.removeItem(CHALLENGE_CACHE_KEY)
    }
  } catch {
    localStorage.removeItem(CHALLENGE_CACHE_KEY)
  }

  let persistTimer = null
  queryClient.getQueryCache().subscribe((event) => {
    if (event?.type !== 'updated' || !isPersistableChallengeQuery(event.query)) return

    window.clearTimeout(persistTimer)
    persistTimer = window.setTimeout(() => {
      try {
        const clientState = dehydrate(queryClient, {
          shouldDehydrateQuery: query =>
            query.state.status === 'success' && isPersistableChallengeQuery(query),
        })
        localStorage.setItem(CHALLENGE_CACHE_KEY, JSON.stringify({
          timestamp: Date.now(),
          clientState,
        }))
      } catch {
        localStorage.removeItem(CHALLENGE_CACHE_KEY)
      }
    }, 250)
  })
}
