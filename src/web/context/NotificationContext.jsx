import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import Notification from '../components/Notification'

const NotificationContext = createContext(null)

const DEFAULT_DURATION = 5000

export function NotificationProvider({ children }) {
  const [items, setItems] = useState([])
  const timersRef = useRef(new Map())

  const dismiss = useCallback((id) => {
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
    setItems(curr => curr.filter(n => n.id !== id))
  }, [])

  const notify = useCallback((payload) => {
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
  }, [dismiss])

  useEffect(() => () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current.clear()
  }, [])

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
