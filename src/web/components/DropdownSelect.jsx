import {
  Children,
  forwardRef,
  isValidElement,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import './DropdownSelect.scss'

const ChevronDown = () => (
  <svg
    viewBox="0 0 10 6"
    width="10"
    height="6"
    fill="currentColor"
    shapeRendering="crispEdges"
    aria-hidden="true"
    className="dropdown-select__chevron"
  >
    <rect x="0" y="0" width="2" height="2" />
    <rect x="8" y="0" width="2" height="2" />
    <rect x="2" y="2" width="2" height="2" />
    <rect x="6" y="2" width="2" height="2" />
    <rect x="4" y="4" width="2" height="2" />
  </svg>
)

const toOption = option => {
  if (typeof option !== 'object' || option === null) {
    return { value: String(option), label: option }
  }

  const { value, label, disabled } = option
  return {
    value: String(value),
    label: label ?? value,
    disabled: Boolean(disabled),
  }
}

const optionsFromChildren = children => Children.toArray(children)
  .filter(isValidElement)
  .map(child => ({
    value: String(child.props.value),
    label: child.props.children,
    disabled: Boolean(child.props.disabled),
  }))

const getNextEnabledIndex = (options, start, direction) => {
  if (!options.length) return -1

  for (let step = 0; step < options.length; step += 1) {
    const index = (start + (step * direction) + options.length) % options.length
    if (!options[index].disabled) return index
  }

  return -1
}

const DropdownSelect = forwardRef(function DropdownSelect(
  {
    className = '',
    wrapperClassName = '',
    icon,
    options,
    placeholder,
    children,
    value,
    defaultValue = '',
    onChange,
    name,
    disabled = false,
    required = false,
    id,
    'aria-label': ariaLabel,
    ...props
  },
  ref,
) {
  const generatedId = useId()
  const controlId = id ?? `dropdown-select-${generatedId}`
  const listboxId = `${controlId}-listbox`
  const rootRef = useRef(null)
  const buttonRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [internalValue, setInternalValue] = useState(String(defaultValue))
  const selectedValue = value === undefined ? internalValue : String(value)

  const normalizedOptions = useMemo(
    () => (options ? options.map(toOption) : optionsFromChildren(children)),
    [children, options],
  )
  const selectedIndex = normalizedOptions.findIndex(option => option.value === selectedValue)
  const selectedOption = selectedIndex >= 0 ? normalizedOptions[selectedIndex] : null
  const displayLabel = selectedOption?.label ?? placeholder ?? ''

  useEffect(() => {
    if (!open) return undefined

    const handlePointerDown = event => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  const setButtonRef = node => {
    buttonRef.current = node

    if (typeof ref === 'function') ref(node)
    else if (ref) ref.current = node
  }

  const openList = () => {
    if (disabled) return
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : getNextEnabledIndex(normalizedOptions, 0, 1))
    setOpen(true)
  }

  const closeList = () => setOpen(false)

  const selectOption = option => {
    if (option.disabled) return

    if (value === undefined) setInternalValue(option.value)
    onChange?.({
      target: { name, value: option.value },
      currentTarget: { name, value: option.value },
    })
    closeList()
    buttonRef.current?.focus()
  }

  const handleKeyDown = event => {
    if (disabled) return

    if (event.key === 'Escape') {
      event.preventDefault()
      closeList()
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (!open) {
        openList()
        return
      }

      if (activeIndex >= 0) selectOption(normalizedOptions[activeIndex])
      return
    }

    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return

    event.preventDefault()
    const direction = event.key === 'ArrowDown' ? 1 : -1
    const start = open && activeIndex >= 0 ? activeIndex + direction : selectedIndex + direction
    const nextIndex = getNextEnabledIndex(normalizedOptions, start, direction)
    if (nextIndex < 0) return

    setActiveIndex(nextIndex)
    if (!open) setOpen(true)
  }

  return (
    <div
      ref={rootRef}
      className={[
        'dropdown-select-wrap',
        open && 'dropdown-select-wrap--open',
        disabled && 'dropdown-select-wrap--disabled',
        wrapperClassName,
      ].filter(Boolean).join(' ')}
    >
      {name && <input type="hidden" name={name} value={selectedValue} required={required} />}
      {icon && <span className="dropdown-select-wrap__icon" aria-hidden="true">{icon}</span>}
      <button
        ref={setButtonRef}
        id={controlId}
        type="button"
        className={[
          'dropdown-select',
          icon && 'dropdown-select--with-icon',
          !selectedOption && 'dropdown-select--placeholder',
          className,
        ].filter(Boolean).join(' ')}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        onClick={() => (open ? closeList() : openList())}
        onKeyDown={handleKeyDown}
        {...props}
      >
        <span className="dropdown-select__label">{displayLabel}</span>
        <span className="dropdown-select__arrow" aria-hidden="true">
          <ChevronDown />
        </span>
      </button>
      {open && (
        <div id={listboxId} className="dropdown-select__menu" role="listbox" aria-labelledby={ariaLabel ? undefined : controlId}>
          {normalizedOptions.map((option, index) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === selectedValue}
              disabled={option.disabled}
              className={[
                'dropdown-select__option',
                option.value === selectedValue && 'dropdown-select__option--selected',
                index === activeIndex && 'dropdown-select__option--active',
              ].filter(Boolean).join(' ')}
              onClick={() => selectOption(option)}
              onMouseEnter={() => !option.disabled && setActiveIndex(index)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
})

export default DropdownSelect
