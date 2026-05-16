import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './AuthContext'
import { useLang } from './LangContext'
import { useNotifications } from './NotificationContext'
import { apiGetFriends, apiGetFriendRequests } from '@shared/api/friends'

const FriendsContext = createContext(null)

const POLL_INTERVAL = 30000

export function FriendsProvider({ children }) {
  const { user } = useAuth()
  const { t } = useLang()
  const { notify } = useNotifications()
  const [friends, setFriends] = useState([])
  const [requests, setRequests] = useState([])
  const seenRef = useRef({ initialized: false, requestIds: new Set() })

  const refresh = useCallback(async () => {
    if (!user) return
    try {
      const [f, r] = await Promise.all([apiGetFriends(), apiGetFriendRequests()])
      setFriends(f.filter(x => x.status === 'accepted'))
      setRequests(r.filter(x => x.direction === 'received'))
    } catch {
      // swallow
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      setFriends([])
      setRequests([])
      seenRef.current = { initialized: false, requestIds: new Set() }
      return
    }

    refresh()

    let pollId = null
    const start = () => {
      clearInterval(pollId)
      pollId = setInterval(refresh, POLL_INTERVAL)
    }
    const stop = () => clearInterval(pollId)

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        refresh()
        start()
      } else {
        stop()
      }
    }

    if (document.visibilityState === 'visible') start()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [user, refresh])

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
