import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './AuthContext'
import { useLang } from './LangContext'
import { useNotifications } from './NotificationContext'
import { apiGetBattles } from '@shared/api/battles'

const BattlesContext = createContext(null)

const POLL_INTERVAL = 15000

function opponentName(battle, userId) {
  const opp = battle.player1?.id === userId ? battle.player2 : battle.player1
  return opp?.name ?? opp?.username ?? '?'
}

export function BattlesProvider({ children }) {
  const { user } = useAuth()
  const { t } = useLang()
  const { notify } = useNotifications()
  const [battles, setBattles] = useState([])
  const seenRef = useRef({ initialized: false, inviteIds: new Set(), myTurnIds: new Set() })

  const refresh = useCallback(async () => {
    if (!user) return
    try {
      const data = await apiGetBattles()
      setBattles(data)
    } catch {
      // swallow
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      setBattles([])
      seenRef.current = { initialized: false, inviteIds: new Set(), myTurnIds: new Set() }
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

    const inviteIds = new Set()
    const myTurnIds = new Set()
    const inviteBattles = new Map()
    const turnBattles = new Map()

    for (const b of battles) {
      if (b.status === 'pending' && b.player2?.id === user.id) {
        inviteIds.add(b.id)
        inviteBattles.set(b.id, b)
      }
      if (b.status === 'active' && b.current_turn_id === user.id) {
        myTurnIds.add(b.id)
        turnBattles.set(b.id, b)
      }
    }

    const prev = seenRef.current
    if (prev.initialized) {
      for (const id of inviteIds) {
        if (!prev.inviteIds.has(id)) {
          const battle = inviteBattles.get(id)
          notify({
            key: `battle-invite-${id}`,
            title: t('notifications.newInvite'),
            message: opponentName(battle, user.id),
            link: '/battles',
          })
        }
      }
      for (const id of myTurnIds) {
        if (!prev.myTurnIds.has(id)) {
          const battle = turnBattles.get(id)
          notify({
            key: `battle-turn-${id}`,
            title: t('notifications.yourTurn'),
            message: opponentName(battle, user.id),
            link: `/battles/${id}`,
          })
        }
      }
    }

    seenRef.current = { initialized: true, inviteIds, myTurnIds }
  }, [battles, user, notify, t])

  return (
    <BattlesContext.Provider value={{ battles, refresh }}>
      {children}
    </BattlesContext.Provider>
  )
}

export const useBattles = () => useContext(BattlesContext)
