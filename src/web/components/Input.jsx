import { forwardRef } from 'react'
import './Input.scss'

const Input = forwardRef(function Input({
  className = '',
  icon,
  readOnly,
  tabIndex,
  onMouseDown,
  ...props
}, ref) {
  const handleMouseDown = (event) => {
    if (readOnly) event.preventDefault()
    onMouseDown?.(event)
  }

  const inputEl = (
    <input
      ref={ref}
      className={[
        'input',
        icon && 'input--with-icon',
        readOnly && 'input--read-only',
        className,
      ].filter(Boolean).join(' ')}
      readOnly={readOnly}
      tabIndex={readOnly ? -1 : tabIndex}
      onMouseDown={handleMouseDown}
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
})

export default Input
