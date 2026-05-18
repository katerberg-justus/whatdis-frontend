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
const SYSTEM_NOTIFICATIONS_ENABLED_KEY = 'notifications.systemEnabled'
const SYSTEM_NOTIFICATION_ICON = '/pwa-192x192.png'

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

function getNotificationPermission() {
  if (typeof Notification === 'undefined') return 'unsupported'
  return Notification.permission
}

function supportsSystemNotifications() {
  return typeof window !== 'undefined' &&
    typeof Notification !== 'undefined' &&
    'serviceWorker' in navigator
}

export function NotificationProvider({ children }) {
  const { pathname, search, hash } = useLocation()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { user } = useAuth()
  const { t } = useLang()
  const [items, setItems] = useState([])
  const [notificationPermission, setNotificationPermission] = useState(getNotificationPermission)
  const [systemNotificationsEnabled, setSystemNotificationsEnabled] = useState(() =>
    supportsSystemNotifications() &&
    Notification.permission === 'granted' &&
    localStorage.getItem(SYSTEM_NOTIFICATIONS_ENABLED_KEY) === '1'
  )
  const timersRef = useRef(new Map())
  const offlineNotificationRef = useRef(null)
  const wasOfflineRef = useRef(typeof navigator !== 'undefined' ? !navigator.onLine : false)
  const { data: dailies = [], isSuccess: dailiesLoaded } = useDailyChallengesQuery({
    enabled: Boolean(user),
    refetchInterval: user ? 5 * 60 * 1000 : false,
    refetchIntervalInBackground: true,
  })
  const { data: packs = [], isSuccess: packsLoaded } = usePacksQuery({
    enabled: Boolean(user),
    refetchInterval: user ? 5 * 60 * 1000 : false,
    refetchIntervalInBackground: true,
  })

  const dismiss = useCallback((id) => {
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
    setItems(curr => curr.filter(n => n.id !== id))
  }, [])

  const showSystemNotification = useCallback((payload) => {
    if (!payload.system || !supportsSystemNotifications()) return
    if (Notification.permission !== 'granted') return
    if (localStorage.getItem(SYSTEM_NOTIFICATIONS_ENABLED_KEY) !== '1') return
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') return

    const title = payload.title || 'WHATDIS?!'
    const targetUrl = payload.link
      ? new URL(payload.link, window.location.origin).toString()
      : window.location.origin
    const options = {
      body: payload.message || undefined,
      icon: SYSTEM_NOTIFICATION_ICON,
      badge: SYSTEM_NOTIFICATION_ICON,
      tag: payload.key || undefined,
      data: { url: targetUrl },
    }

    navigator.serviceWorker.ready
      .then(registration => registration.showNotification(title, options))
      .catch(() => {
        const notification = new Notification(title, options)
        notification.onclick = () => {
          window.focus()
          if (payload.link) navigate(payload.link)
          notification.close()
        }
      })
  }, [navigate])

  const notify = useCallback((payload) => {
    const isCurrentPath = payload.link && normalizePath(payload.link) === normalizePath(pathname)
    if (isCurrentPath && (typeof document === 'undefined' || document.visibilityState === 'visible')) {
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

    showSystemNotification(next)
    return id
  }, [dismiss, pathname, showSystemNotification])

  const requestSystemNotifications = useCallback(async () => {
    if (!supportsSystemNotifications()) {
      setNotificationPermission('unsupported')
      setSystemNotificationsEnabled(false)
      return 'unsupported'
    }

    const permission = await Notification.requestPermission()
    setNotificationPermission(permission)

    const enabled = permission === 'granted'
    setSystemNotificationsEnabled(enabled)
    if (enabled) {
      localStorage.setItem(SYSTEM_NOTIFICATIONS_ENABLED_KEY, '1')
    } else {
      localStorage.removeItem(SYSTEM_NOTIFICATIONS_ENABLED_KEY)
    }
    return permission
  }, [])

  const disableSystemNotifications = useCallback(() => {
    localStorage.removeItem(SYSTEM_NOTIFICATIONS_ENABLED_KEY)
    setSystemNotificationsEnabled(false)
    setNotificationPermission(getNotificationPermission())
  }, [])

  useEffect(() => () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current.clear()
  }, [])

  useEffect(() => {
    function showOfflineNotification() {
      if (offlineNotificationRef.current) {
        dismiss(offlineNotificationRef.current)
      }

      wasOfflineRef.current = true
      offlineNotificationRef.current = notify({
        key: 'network-offline',
        title: t('notifications.offlineTitle'),
        message: t('notifications.offlineMessage'),
        duration: 0,
      })
    }

    function showOnlineNotification() {
      const offlineId = offlineNotificationRef.current
      if (offlineId) {
        dismiss(offlineId)
        offlineNotificationRef.current = null
      }

      if (!wasOfflineRef.current) return
      wasOfflineRef.current = false

      notify({
        key: `network-online-${Date.now()}`,
        title: t('notifications.onlineTitle'),
        duration: 3500,
      })
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      showOfflineNotification()
    }

    window.addEventListener('offline', showOfflineNotification)
    window.addEventListener('online', showOnlineNotification)

    return () => {
      window.removeEventListener('offline', showOfflineNotification)
      window.removeEventListener('online', showOnlineNotification)
    }
  }, [dismiss, notify, t])

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
          system: true,
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
          system: true,
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
    <NotificationContext.Provider value={{
      notify,
      dismiss,
      systemNotificationsSupported: supportsSystemNotifications(),
      systemNotificationsEnabled,
      notificationPermission,
      requestSystemNotifications,
      disableSystemNotifications,
    }}>
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
