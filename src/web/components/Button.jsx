import './Button.scss'

const Chevron = () => (
  <svg
    viewBox="0 0 7 10" width="7" height="10"
    fill="currentColor" shapeRendering="crispEdges"
    aria-hidden="true" className="btn__chevron"
  >
    <rect x="0" y="0" width="3" height="2" />
    <rect x="2" y="2" width="3" height="2" />
    <rect x="4" y="4" width="3" height="2" />
    <rect x="2" y="6" width="3" height="2" />
    <rect x="0" y="8" width="3" height="2" />
  </svg>
)

export default function Button({ color = 'pink', cta = false, fullWidth = false, className = '', icon, children, ...props }) {
  const iconEl = icon !== undefined ? icon : <Chevron />
  const cls = [
    'btn',
    `btn--${color}`,
    cta && 'btn--cta',
    fullWidth && 'btn--full',
    className,
  ].filter(Boolean).join(' ')

  return (
    <button className={cls} {...props}>
      <span className="btn__label">{children}</span>
      {iconEl !== null && <span className="btn__icon">{iconEl}</span>}
    </button>
  )
}
