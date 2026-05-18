import { createContext, useContext, useEffect, useRef } from 'react'
import { useAuth } from './AuthContext'
import { useLang } from './LangContext'
import { useNotifications } from './NotificationContext'
import { useBattlesQuery } from '@shared/api/battles'

const BattlesContext = createContext(null)

function opponentName(battle, userId) {
  const opp = battle.player1?.id === userId ? battle.player2 : battle.player1
  return opp?.name ?? opp?.username ?? '?'
}

export function BattlesProvider({ children }) {
  const { user } = useAuth()
  const { t } = useLang()
  const { notify } = useNotifications()
  const seenRef = useRef({ initialized: false, inviteIds: new Set(), myTurnIds: new Set() })

  const { data: battles = [], refetch } = useBattlesQuery({
    enabled: Boolean(user),
    refetchInterval: user ? 15 * 1000 : false,
    refetchIntervalInBackground: true,
  })

  useEffect(() => {
    if (!user) {
      seenRef.current = { initialized: false, inviteIds: new Set(), myTurnIds: new Set() }
    }
  }, [user])

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
            system: true,
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
            system: true,
          })
        }
      }
    }

    seenRef.current = { initialized: true, inviteIds, myTurnIds }
  }, [battles, user, notify, t])

  return (
    <BattlesContext.Provider value={{ battles, refresh: refetch }}>
      {children}
    </BattlesContext.Provider>
  )
}

export const useBattles = () => useContext(BattlesContext)
