import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useDailyChallengesQuery, usePacksQuery } from '@shared/api/challenges'
import { qk } from '@shared/api/queryKeys'
import Notification from '../components/Notification'
import { useAuth } from './AuthContext'
import { useLang } from './LangContext'

const NotificationContext = createContext(null)

const DEFAULT_DURATION = 5000
const LAST_DAILY_CHALLENGE_ID_KEY = 'notifications.lastDailyChallengeId'
const LAST_CHALLENGE_COUNT_KEY = 'notifications.lastChallengeCount'

function latestDailyChallenge(dailies) {
  return [...dailies]
    .filter(daily => daily?.id)
    .sort((a, b) => {
      const dateCompare = String(a.available_on ?? '').localeCompare(String(b.available_on ?? ''))
      if (dateCompare !== 0) return dateCompare
      return String(a.id).localeCompare(String(b.id))
    })
    .at(-1) ?? null
}

function visibleChallengeCount(packs) {
  return packs
    .filter(pack => {
      const total = Number(pack?.total_count ?? 0)
      return total > 0 && !pack?.is_daily && !/daily/i.test(pack?.name ?? '') && pack?.is_battle !== true
    })
    .reduce((sum, pack) => sum + Number(pack.total_count ?? 0), 0)
}

function normalizePath(path) {
  const cleanPath = path.split(/[?#]/)[0] || '/'
  return cleanPath.length > 1 ? cleanPath.replace(/\/+$/, '') : cleanPath
}

export function NotificationProvider({ children }) {
  const { pathname, search, hash } = useLocation()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { user } = useAuth()
  const { t } = useLang()
  const [items, setItems] = useState([])
  const timersRef = useRef(new Map())
  const { data: dailies = [], isSuccess: dailiesLoaded } = useDailyChallengesQuery({
    enabled: Boolean(user),
    refetchInterval: user ? 5 * 60 * 1000 : false,
    refetchIntervalInBackground: false,
  })
  const { data: packs = [], isSuccess: packsLoaded } = usePacksQuery({
    enabled: Boolean(user),
    refetchInterval: user ? 5 * 60 * 1000 : false,
    refetchIntervalInBackground: false,
  })

  const dismiss = useCallback((id) => {
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
    setItems(curr => curr.filter(n => n.id !== id))
  }, [])

  const notify = useCallback((payload) => {
    if (payload.link && normalizePath(payload.link) === normalizePath(pathname)) {
      return null
    }

    const duration = payload.duration ?? DEFAULT_DURATION
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const next = { id, ...payload }

    setItems(curr => {
      if (next.key && curr.some(n => n.key === next.key)) return curr
      return [...curr, next]
    })

    if (duration > 0) {
      const timer = setTimeout(() => dismiss(id), duration)
      timersRef.current.set(id, timer)
    }
    return id
  }, [dismiss, pathname])

  useEffect(() => () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current.clear()
  }, [])

  useEffect(() => {
    if (!dailiesLoaded) return

    const latest = latestDailyChallenge(dailies)
    if (!latest) return

    const latestId = String(latest.id)
    const previousId = localStorage.getItem(LAST_DAILY_CHALLENGE_ID_KEY)

    if (previousId !== null && previousId !== latestId && latest.completed !== true) {
      window.setTimeout(() => {
        notify({
          key: `daily-challenge-${latestId}`,
          title: t('notifications.newDailyChallenge'),
          link: '/challenges',
        })
      }, 0)
    }

    localStorage.setItem(LAST_DAILY_CHALLENGE_ID_KEY, latestId)
  }, [dailies, dailiesLoaded, notify, t])

  useEffect(() => {
    if (!packsLoaded) return

    const count = visibleChallengeCount(packs)
    const previousCount = localStorage.getItem(LAST_CHALLENGE_COUNT_KEY)

    if (previousCount !== null && count > Number(previousCount)) {
      window.setTimeout(() => {
        notify({
          key: `challenge-count-${count}`,
          title: t('notifications.newChallengesAdded'),
          link: '/challenges',
        })
      }, 0)
    }

    localStorage.setItem(LAST_CHALLENGE_COUNT_KEY, String(count))
  }, [packs, packsLoaded, notify, t])

  useEffect(() => {
    const params = new URLSearchParams(search)
    const success = params.get('success')
    const purchase = params.get('purchase')
    const isStripeReturn = (success === 'true' || success === 'false') &&
      (purchase === 'nrg' || purchase === 'subscription')

    if (!isStripeReturn) return

    const completed = success === 'true'
    const titleKey = completed
      ? `notifications.${purchase}PurchaseSuccess`
      : `notifications.${purchase}PurchaseCancelled`

    window.setTimeout(() => {
      notify({
        key: `stripe-${purchase}-${success}`,
        title: t(titleKey),
      })
    }, 0)

    if (completed) {
      qc.invalidateQueries({ queryKey: qk.me })
      if (purchase === 'subscription') {
        qc.invalidateQueries({ queryKey: qk.subscription })
      }
    }

    params.delete('success')
    params.delete('purchase')
    const nextSearch = params.toString()
    navigate({
      pathname,
      search: nextSearch ? `?${nextSearch}` : '',
      hash,
    }, { replace: true })
  }, [hash, navigate, notify, pathname, qc, search, t])

  return (
    <NotificationContext.Provider value={{ notify, dismiss }}>
      {children}
      <div className="notifications">
        {items.map(item => (
          <Notification key={item.id} item={item} onDismiss={() => dismiss(item.id)} />
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)
