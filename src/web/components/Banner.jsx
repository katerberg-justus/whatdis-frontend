import Button from './Button'
import IconButton from './IconButton'
import { CloseIcon } from './icons'
import './Banner.scss'

export default function Banner({
  variant = 'cta',
  title,
  message,
  cta,
  onCta,
  children,
  dismissible = false,
  onDismiss,
  dismissLabel = 'Dismiss',
}) {
  return (
    <div className={['banner', `banner--${variant}`, dismissible && 'banner--dismissible'].filter(Boolean).join(' ')}>
      <div className="banner__content">
        <div className="banner__body">
          <p className="banner__title">{title}</p>
          {message && <p className="banner__message">{message}</p>}
          {children}
        </div>
      </div>
      {cta && (
        <Button color="green" cta onClick={onCta}>
          {cta}
        </Button>
      )}
      {dismissible && (
        <IconButton
          className="banner__close"
          icon={<CloseIcon />}
          onClick={onDismiss}
          aria-label={dismissLabel}
        />
      )}
    </div>
  )
}
