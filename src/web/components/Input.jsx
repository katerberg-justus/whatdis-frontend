import './Input.scss'

export default function Input({ className = '', icon, ...props }) {
  const inputEl = (
    <input
      className={['input', icon && 'input--with-icon', className].filter(Boolean).join(' ')}
      {...props}
    />
  )

  if (!icon) return inputEl

  return (
    <div className="input-wrap">
      <span className="input-wrap__icon" aria-hidden="true">{icon}</span>
      {inputEl}
    </div>
  )
}
