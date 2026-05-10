import './Button.scss'

export default function Button({ color = 'default', fullWidth = false, className = '', ...props }) {
  const cls = [
    'btn',
    `btn--${color}`,
    fullWidth && 'btn--full',
    className,
  ].filter(Boolean).join(' ')

  return <button className={cls} {...props} />
}
