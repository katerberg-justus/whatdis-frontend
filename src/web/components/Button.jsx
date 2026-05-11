import './Button.scss'

const Chevron = () => (
  <svg
    viewBox="0 0 6 10" width="6" height="10"
    fill="currentColor" shapeRendering="crispEdges"
    aria-hidden="true" className="btn__chevron"
  >
    <rect x="0" y="0" width="2" height="2" />
    <rect x="2" y="2" width="2" height="2" />
    <rect x="4" y="4" width="2" height="2" />
    <rect x="2" y="6" width="2" height="2" />
    <rect x="0" y="8" width="2" height="2" />
  </svg>
)

export default function Button({ color = 'pink', fullWidth = false, className = '', icon, children, ...props }) {
  const cls = [
    'btn',
    `btn--${color}`,
    fullWidth && 'btn--full',
    className,
  ].filter(Boolean).join(' ')

  return (
    <button className={cls} {...props}>
      {children}
      {icon !== undefined ? icon : <Chevron />}
    </button>
  )
}
