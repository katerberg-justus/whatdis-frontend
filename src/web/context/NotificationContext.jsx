import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useDailyChallengesQuery, usePacksQuery } from '@shared/api/challenges'
import { qk } from '@shared/api/queryKeys'
import {
  apiCreatePushSubscription,
  apiDeletePushSubscription,
  apiGetVapidPublicKey,
} from '@shared/api/pushSubscriptions'
import ToastNotification from '../components/Notification'
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
  if (typeof window === 'undefined' || typeof window.Notification === 'undefined') return 'unsupported'
  return window.Notification.permission
}

function isStandalonePwa() {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(display-mode: standalone)').matches ||
    window.matchMedia?.('(display-mode: fullscreen)').matches ||
    window.navigator.standalone === true
}

function supportsSystemNotifications() {
  return typeof window !== 'undefined' &&
    typeof window.Notification !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

async function currentPushSubscription() {
  if (!supportsSystemNotifications()) return null
  const registration = await navigator.serviceWorker.ready
  return registration.pushManager.getSubscription()
}

function serializePushSubscription(subscription) {
  return subscription.toJSON()
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
    window.Notification.permission === 'granted' &&
    localStorage.getItem(SYSTEM_NOTIFICATIONS_ENABLED_KEY) === '1'
  )
  const [systemNotificationError, setSystemNotificationError] = useState(null)
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
    if (window.Notification.permission !== 'granted') return
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
        const notification = new window.Notification(title, options)
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
      setSystemNotificationError('unsupported')
      return 'unsupported'
    }

    const permission = await window.Notification.requestPermission()
    setNotificationPermission(permission)
    setSystemNotificationError(null)

    if (permission !== 'granted') {
      setSystemNotificationsEnabled(false)
      localStorage.removeItem(SYSTEM_NOTIFICATIONS_ENABLED_KEY)
      return permission
    }

    const { public_key: publicKey } = await apiGetVapidPublicKey()
    if (!publicKey) {
      setSystemNotificationsEnabled(false)
      setSystemNotificationError('unconfigured')
      localStorage.removeItem(SYSTEM_NOTIFICATIONS_ENABLED_KEY)
      return 'unconfigured'
    }

    const registration = await navigator.serviceWorker.ready
    const existing = await registration.pushManager.getSubscription()
    const subscription = existing ?? await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    })
    await apiCreatePushSubscription(serializePushSubscription(subscription))

    setSystemNotificationsEnabled(true)
    setSystemNotificationError(null)
    localStorage.setItem(SYSTEM_NOTIFICATIONS_ENABLED_KEY, '1')
    return permission
  }, [])

  const disableSystemNotifications = useCallback(async () => {
    const subscription = await currentPushSubscription()
    if (subscription) {
      try {
        await apiDeletePushSubscription(subscription.endpoint)
      } catch {
        // Local opt-out should still succeed if the server record is already gone.
      }
      await subscription.unsubscribe()
    }
    localStorage.removeItem(SYSTEM_NOTIFICATIONS_ENABLED_KEY)
    setSystemNotificationsEnabled(false)
    setSystemNotificationError(null)
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
      systemNotificationsAvailable: isStandalonePwa() && supportsSystemNotifications(),
      systemNotificationsEnabled,
      systemNotificationError,
      notificationPermission,
      requestSystemNotifications,
      disableSystemNotifications,
    }}>
      {children}
      <div className="notifications">
        {items.map(item => (
          <ToastNotification key={item.id} item={item} onDismiss={() => dismiss(item.id)} />
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)
