import { useNavigate } from 'react-router'
import { useLang } from '../context/LangContext'
import Button from './Button'
import './LockedOverlay.scss'

const IconLock = () => (
  <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
    {/* shackle + body base */}
    <path fill="currentColor" d="M5 0h6v2H5zM4 1h2v6H4zM10 1h2v6h-2zM1 6h14v10H1z" />
    {/* highlights */}
    <path fill="#fff" fillOpacity="0.28" d="M5 0h1v2H5zM4 1h1v6H4zM1 6h13v1H1zM1 7h1v8H1z" />
    {/* shadows */}
    <path fill="#000" fillOpacity="0.28" d="M10 0h1v2h-1zM11 1h1v6h-1zM2 15h13v1H2zM14 7h1v8h-1z" />
    {/* keyhole */}
    <path fill="#000" fillOpacity="0.55" d="M7 9h2v2H7zM7 11h2v3H7z" />
  </svg>
)

export default function LockedOverlay({ title, message }) {
  const navigate = useNavigate()
  const { t } = useLang()

  return (
    <div className="locked-overlay">
      <span className="locked-overlay__icon"><IconLock /></span>
      <p className="locked-overlay__title">{title}</p>
      <p className="locked-overlay__message">{message}</p>
      <div className="locked-overlay__actions">
        <Button color="blue"  onClick={() => navigate('/login')}>{t('register.signIn')}</Button>
        <Button color="pink"  onClick={() => navigate('/register')}>{t('login.register')}</Button>
      </div>
    </div>
  )
}
