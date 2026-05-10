import { useNavigate } from 'react-router'
import Button from './Button'
import './LockedOverlay.scss'

const IconLock = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
    <rect x="5" y="0" width="6" height="2" />
    <rect x="5" y="2" width="2" height="4" />
    <rect x="9" y="2" width="2" height="4" />
    <rect x="1" y="5" width="14" height="11" />
  </svg>
)

export default function LockedOverlay({ title, message }) {
  const navigate = useNavigate()
  return (
    <div className="locked-overlay">
      <span className="locked-overlay__icon"><IconLock /></span>
      <p className="locked-overlay__title">{title}</p>
      <p className="locked-overlay__message">{message}</p>
      <div className="locked-overlay__actions">
        <Button color="blue"  onClick={() => navigate('/login')}>Sign In</Button>
        <Button color="pink"  onClick={() => navigate('/register')}>Register</Button>
      </div>
    </div>
  )
}
