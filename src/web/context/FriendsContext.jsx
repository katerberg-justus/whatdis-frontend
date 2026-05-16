import { createContext, useContext, useEffect, useMemo, useRef, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { useLang } from './LangContext'
import { useNotifications } from './NotificationContext'
import { useFriendsQuery, useFriendRequestsQuery } from '@shared/api/friends'

const FriendsContext = createContext(null)

export function FriendsProvider({ children }) {
  const { user } = useAuth()
  const { t } = useLang()
  const { notify } = useNotifications()
  const seenRef = useRef({ initialized: false, requestIds: new Set() })

  const queryOpts = {
    enabled: Boolean(user),
    refetchInterval: user ? 30 * 1000 : false,
    refetchIntervalInBackground: false,
  }
  const { data: rawFriends = [], refetch: refetchFriends } = useFriendsQuery(queryOpts)
  const { data: rawRequests = [], refetch: refetchRequests } = useFriendRequestsQuery(queryOpts)

  const friends  = useMemo(() => rawFriends.filter(x => x.status === 'accepted'),     [rawFriends])
  const requests = useMemo(() => rawRequests.filter(x => x.direction === 'received'), [rawRequests])

  const refresh = useCallback(() => {
    refetchFriends()
    refetchRequests()
  }, [refetchFriends, refetchRequests])

  useEffect(() => {
    if (!user) {
      seenRef.current = { initialized: false, requestIds: new Set() }
    }
  }, [user])

  useEffect(() => {
    if (!user) return

    const requestIds = new Set()
    const requestById = new Map()
    for (const r of requests) {
      requestIds.add(r.id)
      requestById.set(r.id, r)
    }

    const prev = seenRef.current
    if (prev.initialized) {
      for (const id of requestIds) {
        if (!prev.requestIds.has(id)) {
          const req = requestById.get(id)
          notify({
            key: `friend-request-${id}`,
            title: t('notifications.newFriendRequest'),
            message: req?.friend?.name ?? req?.friend?.email ?? '',
            link: '/battles/friends',
          })
        }
      }
    }

    seenRef.current = { initialized: true, requestIds }
  }, [requests, user, notify, t])

  return (
    <FriendsContext.Provider value={{ friends, requests, refresh }}>
      {children}
    </FriendsContext.Provider>
  )
}

export const useFriends = () => useContext(FriendsContext)
