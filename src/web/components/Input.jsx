import { forwardRef } from 'react'
import './Input.scss'

const Input = forwardRef(function Input({ className = '', icon, ...props }, ref) {
  const inputEl = (
    <input
      ref={ref}
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
})

export default Input
