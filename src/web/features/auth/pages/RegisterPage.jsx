import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../../../context/AuthContext'
import { useLang } from '../../../context/LangContext'
import Button from '../../../components/Button'
import Input from '../../../components/Input'
import './AuthPage.scss'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate     = useNavigate()
  const { t }        = useLang()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [error,    setError]    = useState(null)
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) { setError(t('register.passwordMismatch')); return }
    setError(null)
    setLoading(true)
    try {
      await register(username, password)
      navigate('/challenges')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth">
      <form className="auth__form" onSubmit={handleSubmit}>
        <h1 className="auth__title">{t('register.title')}</h1>
        {error && <p className="auth__error">{error}</p>}
        <Input
          type="text"
          placeholder={t('register.usernamePlaceholder')}
          value={username}
          onChange={e => setUsername(e.target.value)}
          autoComplete="username"
          required
        />
        <Input
          type="password"
          placeholder={t('register.passwordPlaceholder')}
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="new-password"
          required
        />
        <Input
          type="password"
          placeholder={t('register.confirmPlaceholder')}
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          autoComplete="new-password"
          required
        />
        <Button color="pink" fullWidth disabled={loading}>
          {loading ? t('register.submitting') : t('register.submit')}
        </Button>
        <p className="auth__switch">
          {t('register.hasAccount')} <Link to="/login">{t('register.signIn')}</Link>
        </p>
      </form>
    </div>
  )
}
