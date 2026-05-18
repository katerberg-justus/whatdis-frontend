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
  const { user, logout } = useAuth()
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
      <h2 className="account__heading">{t('profile.accountDetails')}</h2>
      <div className="account__form">
        <div className="account__field">
          <label className="account__field-label" htmlFor="profile-username">{t('profile.username')}</label>
          <Input
            id="profile-username"
            type="text"
            value={user?.name ?? ''}
            autoComplete="name"
            readOnly
          />
        </div>
        <div className="account__field">
          <label className="account__field-label" htmlFor="profile-email">{t('profile.email')}</label>
          <Input
            id="profile-email"
            type="email"
            value={user?.email ?? ''}
            autoComplete="email"
            readOnly
          />
        </div>
      </div>
      <div className="account__divider" />
      <h2 className="account__heading">{t('profile.changePassword')}</h2>
      <form className="account__form" onSubmit={handleSubmit}>
        {error   && <p className="account__error">{error}</p>}
        {success && <p className="account__success">{t('profile.success')}</p>}
        <div className="account__field">
          <label className="account__field-label" htmlFor="profile-current-password">{t('profile.currentPassword')}</label>
          <Input
            id="profile-current-password"
            type="password"
            value={current}
            onChange={e => setCurrent(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <div className="account__field">
          <label className="account__field-label" htmlFor="profile-new-password">{t('profile.newPassword')}</label>
          <Input
            id="profile-new-password"
            type="password"
            value={next}
            onChange={e => setNext(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
        <div className="account__field">
          <label className="account__field-label" htmlFor="profile-confirm-password">{t('profile.confirmPassword')}</label>
          <Input
            id="profile-confirm-password"
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
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
