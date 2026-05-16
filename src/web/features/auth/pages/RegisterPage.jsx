import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../../../context/AuthContext'
import { useLang } from '../../../context/LangContext'
import { apiCheckUserAvailability } from '@shared/api/users'
import Button from '../../../components/Button'
import Input from '../../../components/Input'
import Logo from '../../../components/Logo'
import './AuthPage.scss'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate     = useNavigate()
  const { t }        = useLang()
  const [username, setUsername] = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [error,    setError]    = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [usernameError, setUsernameError] = useState(null)
  const [emailError,    setEmailError]    = useState(null)

  const checkAvailability = async (field, value) => {
    const trimmed = value.trim()
    if (!trimmed) return
    try {
      const data = await apiCheckUserAvailability({ [field]: trimmed })
      const available = data?.[field]
      if (available === false) {
        const msg = field === 'name' ? t('register.usernameTaken') : t('register.emailTaken')
        if (field === 'name') setUsernameError(msg)
        else setEmailError(msg)
      }
    } catch {
      // Network/rate-limit failures shouldn't block submission; the backend
      // will still reject duplicates on submit.
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (usernameError || emailError) return
    if (password !== confirm) { setError(t('register.passwordMismatch')); return }
    setError(null)
    setLoading(true)
    try {
      await register(username, email, password)
      navigate('/challenges', { state: { promptUpgrade: true } })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth">
      <form className="auth__form" onSubmit={handleSubmit}>
        <div className="auth__logo"><Logo /></div>
        <h1 className="auth__title">{t('register.title')}</h1>
        {error && <p className="auth__error">{error}</p>}
        <Input
          type="text"
          placeholder={t('register.usernamePlaceholder')}
          value={username}
          onChange={e => { setUsername(e.target.value); if (usernameError) setUsernameError(null) }}
          onBlur={e => checkAvailability('name', e.target.value)}
          autoComplete="username"
          required
        />
        {usernameError && <p className="auth__error">{usernameError}</p>}
        <Input
          type="email"
          placeholder={t('register.emailPlaceholder')}
          value={email}
          onChange={e => { setEmail(e.target.value); if (emailError) setEmailError(null) }}
          onBlur={e => checkAvailability('email', e.target.value)}
          autoComplete="email"
          required
        />
        {emailError && <p className="auth__error">{emailError}</p>}
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
