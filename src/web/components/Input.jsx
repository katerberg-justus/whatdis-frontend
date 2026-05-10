import './Input.scss'

export default function Input({ className = '', ...props }) {
  return <input className={['input', className].filter(Boolean).join(' ')} {...props} />
}
