import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useLang } from '../../../context/LangContext'
import {
  apiGetFriends,
  apiGetFriendRequests,
  apiSendFriendInvite,
  apiAcceptFriendRequest,
  apiRemoveFriend,
} from '@shared/api/friends'
import Button from '../../../components/Button'
import Input from '../../../components/Input'
import LockedOverlay from '../../../components/LockedOverlay'
import './BattlesPage.scss'

export default function FriendsPage() {
  const { user } = useAuth()
  const { t }    = useLang()

  const [friends,  setFriends]  = useState([])
  const [requests, setRequests] = useState([])
  const [email,    setEmail]    = useState('')
  const [sending,  setSending]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')

  const load = useCallback(() => {
    if (!user) return
    apiGetFriends().then(setFriends).catch(() => {})
    apiGetFriendRequests().then(setRequests).catch(() => {})
  }, [user])

  useEffect(() => { load() }, [load])

  async function handleSendInvite(e) {
    e.preventDefault()
    if (!email.trim()) return
    setSending(true)
    setError('')
    setSuccess('')
    try {
      await apiSendFriendInvite(email.trim())
      setEmail('')
      setSuccess(t('friends.inviteSent'))
      load()
    } catch {
      setError(t('friends.inviteError'))
    } finally {
      setSending(false)
    }
  }

  async function handleAccept(id) {
    try { await apiAcceptFriendRequest(id); load() } catch {}
  }

  async function handleRemove(id) {
    try { await apiRemoveFriend(id); load() } catch {}
  }

  return (
    <div className="battles">
      <div className="locked-wrap">
        <div className={user ? undefined : 'locked-wrap__content'}>

          {/* Incoming requests */}
          {requests.length > 0 && (
            <section className="battles__section">
              <h2 className="battles__section-title">{t('friends.requests')}</h2>
              <ul className="battles__list">
                {requests.map((req) => (
                  <li key={req.id} className="battles__invite">
                    <div className="battles__info">
                      <span className="battles__opponent">{req.sender?.username ?? req.username}</span>
                      <span className="battles__meta">{req.sender?.email ?? req.email}</span>
                    </div>
                    <div className="battles__actions">
                      <Button color="green" onClick={() => handleAccept(req.id)}>{t('battles.accept')}</Button>
                      <Button color="muted" onClick={() => handleRemove(req.id)}>{t('battles.decline')}</Button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Friends list */}
          <section className="battles__section">
            <h2 className="battles__section-title">{t('friends.list')}</h2>
            {friends.length === 0 ? (
              <p className="battles__empty">{t('friends.noFriends')}</p>
            ) : (
              <ul className="battles__list">
                {friends.map((f) => (
                  <li key={f.id} className="battles__invite">
                    <div className="battles__info">
                      <span className="battles__opponent">{f.username}</span>
                    </div>
                    <div className="battles__actions">
                      <Button color="muted" onClick={() => handleRemove(f.friendship_id ?? f.id)}>
                        {t('friends.remove')}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Add friend */}
          <section className="battles__section">
            <h2 className="battles__section-title">{t('friends.addFriend')}</h2>
            <form className="friends__invite-form" onSubmit={handleSendInvite}>
              <Input
                type="email"
                placeholder={t('friends.emailPlaceholder')}
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <Button color="blue" disabled={sending || !email.trim()}>
                {sending ? t('friends.sending') : t('friends.send')}
              </Button>
            </form>
            {error   && <p className="battles__error">{error}</p>}
            {success && <p className="battles__success">{success}</p>}
          </section>

        </div>

        {!user && (
          <LockedOverlay
            title={t('battles.lockedTitle')}
            message={t('battles.lockedMessage')}
          />
        )}
      </div>
    </div>
  )
}
