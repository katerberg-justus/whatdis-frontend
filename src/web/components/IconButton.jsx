import './IconButton.scss'

export default function IconButton({ icon, className = '', ...props }) {
  return (
    <button className={['icon-btn', className].filter(Boolean).join(' ')} {...props}>
      {icon}
    </button>
  )
}
