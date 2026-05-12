import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../../../context/AuthContext'
import { useLang } from '../../../context/LangContext'
import Button from '../../../components/Button'
import Input from '../../../components/Input'
import './AuthPage.scss'

const LockIcon = () => (
  <svg viewBox="0 0 16 16" width="11" height="11" fill="currentColor" shapeRendering="crispEdges">
    <rect x="5" y="0" width="6" height="2" />
    <rect x="5" y="2" width="2" height="4" />
    <rect x="9" y="2" width="2" height="4" />
    <rect x="1" y="6" width="14" height="10" />
  </svg>
)

export default function LoginPage() {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const { t }      = useLang()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState(null)
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(username, password)
      navigate('/challenges')
    } catch (err) {
      setError(
        err.response?.status === 401
          ? t('login.invalidCredentials')
          : err.message
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth">
      <form className="auth__form" onSubmit={handleSubmit}>
        <h1 className="auth__title">{t('login.title')}</h1>
        {error && <p className="auth__error">{error}</p>}
        <Input
          icon="@"
          type="text"
          placeholder={t('login.usernamePlaceholder')}
          value={username}
          onChange={e => setUsername(e.target.value)}
          autoComplete="username"
          required
        />
        <Input
          icon={<LockIcon />}
          type="password"
          placeholder={t('login.passwordPlaceholder')}
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
        <Button fullWidth disabled={loading}>
          {loading ? t('login.submitting') : t('login.submit')}
        </Button>
        <p className="auth__switch">
          {t('login.noAccount')} <Link to="/register">{t('login.register')}</Link>
        </p>
      </form>
    </div>
  )
}
