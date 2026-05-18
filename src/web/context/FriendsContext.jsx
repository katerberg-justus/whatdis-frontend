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
  const seenRef = useRef({ initialized: false, requestIds: new Set(), friendIds: new Set() })

  const queryOpts = {
    enabled: Boolean(user),
    refetchInterval: user ? 30 * 1000 : false,
    refetchIntervalInBackground: true,
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
      seenRef.current = { initialized: false, requestIds: new Set(), friendIds: new Set() }
    }
  }, [user])

  useEffect(() => {
    if (!user) return

    const requestIds = new Set()
    const friendIds = new Set()
    const requestById = new Map()
    const friendById = new Map()
    for (const r of requests) {
      requestIds.add(r.id)
      requestById.set(r.id, r)
    }
    for (const f of friends) {
      friendIds.add(f.id)
      friendById.set(f.id, f)
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
            system: true,
          })
        }
      }
      for (const id of friendIds) {
        if (!prev.friendIds.has(id) && !prev.requestIds.has(id)) {
          const friendship = friendById.get(id)
          notify({
            key: `friend-accepted-${id}`,
            title: t('notifications.friendAccepted'),
            message: friendship?.friend?.name ?? friendship?.friend?.email ?? '',
            link: '/battles/friends',
            system: true,
          })
        }
      }
    }

    seenRef.current = { initialized: true, requestIds, friendIds }
  }, [friends, requests, user, notify, t])

  return (
    <FriendsContext.Provider value={{ friends, requests, refresh }}>
      {children}
    </FriendsContext.Provider>
  )
}

export const useFriends = () => useContext(FriendsContext)
