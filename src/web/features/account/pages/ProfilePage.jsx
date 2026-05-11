import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useLang } from '../../../context/LangContext'
import { useAuth } from '../../../context/AuthContext'
import { apiChangePassword } from '@shared/api/users'
import Input from '../../../components/Input'
import Button from '../../../components/Button'
import './AccountPage.scss'

export default function ProfilePage() {
  const { t }      = useLang()
  const { logout } = useAuth()
  const navigate   = useNavigate()
  const [current, setCurrent] = useState('')
  const [next,    setNext]    = useState('')
  const [confirm, setConfirm] = useState('')
  const [error,   setError]   = useState(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (next !== confirm) { setError(t('profile.mismatch')); return }
    setError(null); setSuccess(false); setLoading(true)
    try {
      await apiChangePassword(current, next)
      setSuccess(true)
      setCurrent(''); setNext(''); setConfirm('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="account__section">
      <h2 className="account__heading">{t('profile.changePassword')}</h2>
      <form className="account__form" onSubmit={handleSubmit}>
        {error   && <p className="account__error">{error}</p>}
        {success && <p className="account__success">{t('profile.success')}</p>}
        <Input
          type="password"
          placeholder={t('profile.currentPassword')}
          value={current}
          onChange={e => setCurrent(e.target.value)}
          autoComplete="current-password"
          required
        />
        <Input
          type="password"
          placeholder={t('profile.newPassword')}
          value={next}
          onChange={e => setNext(e.target.value)}
          autoComplete="new-password"
          required
        />
        <Input
          type="password"
          placeholder={t('profile.confirmPassword')}
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          autoComplete="new-password"
          required
        />
        <Button fullWidth disabled={loading}>
          {loading ? t('profile.saving') : t('profile.save')}
        </Button>
      </form>
      <div className="account__divider" />
      <Button
        color="muted"
        fullWidth
        onClick={async () => { await logout(); navigate('/login') }}
      >
        {t('profile.logout')}
      </Button>
    </div>
  )
}
