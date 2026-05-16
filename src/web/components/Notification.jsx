import { useNavigate } from 'react-router'
import IconButton from './IconButton'
import { CloseIcon } from './icons'
import './Notification.scss'

const DEFAULT_DURATION = 5000

export default function Notification({ item, onDismiss }) {
  const navigate = useNavigate()
  const { title, message, link } = item
  const duration = item.duration ?? DEFAULT_DURATION
  const showsProgress = duration > 0

  function handleClick() {
    if (!link) return
    navigate(link)
    onDismiss()
  }

  function handleClose(e) {
    e.stopPropagation()
    onDismiss()
  }

  return (
    <div
      className={['notification', link && 'notification--clickable'].filter(Boolean).join(' ')}
      onClick={handleClick}
      role={link ? 'button' : undefined}
    >
      <div className="notification__body">
        {title && <span className="notification__title">{title}</span>}
        {message && <span className="notification__message">{message}</span>}
      </div>
      <IconButton
        className="notification__close"
        icon={<CloseIcon />}
        onClick={handleClose}
        aria-label="Close"
      />
      {showsProgress && (
        <div
          className="notification__progress"
          style={{ animationDuration: `${duration}ms` }}
        />
      )}
    </div>
  )
}
