import './RadioButton.scss'

export default function RadioButton({
  checked = false,
  disabled = false,
  fullWidth = false,
  className = '',
  name,
  value,
  onChange,
  children,
}) {
  const cls = [
    'radio-btn',
    checked && 'radio-btn--checked',
    disabled && 'radio-btn--disabled',
    fullWidth && 'radio-btn--full',
    className,
  ].filter(Boolean).join(' ')

  return (
    <label className={cls}>
      <input
        className="radio-btn__input"
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
      <span className="radio-btn__label">{children}</span>
      <span className="radio-btn__mark" aria-hidden="true" />
    </label>
  )
}
