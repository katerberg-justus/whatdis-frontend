import Button from './Button'
import './Banner.scss'

export default function Banner({ variant = 'cta', title, message, cta, onCta, children }) {
  return (
    <div className={`banner banner--${variant}`}>
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
    </div>
  )
}
