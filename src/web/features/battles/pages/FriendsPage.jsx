import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router'
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
import IconButton from '../../../components/IconButton'
import { TrashIcon, EyeIcon } from '../../../components/icons'
import Input from '../../../components/Input'
import './BattlesPage.scss'

const SwordIcon = () => (
  <svg className="battles__button-icon" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true">
    <rect x="7" y="1" width="2" height="1" />
    <rect x="6" y="2" width="4" height="1" />
    <rect x="6" y="3" width="4" height="6" />
    <rect x="7" y="9" width="2" height="1" />
    <rect x="4" y="10" width="8" height="2" />
    <rect x="7" y="12" width="2" height="2" />
    <rect x="6" y="14" width="4" height="1" />
  </svg>
)

export default function FriendsPage() {
  const { user }   = useAuth()
  const { t }      = useLang()
  const navigate   = useNavigate()

  const [friends,   setFriends]   = useState([])
  const [requests,  setRequests]  = useState([])
  const [email,     setEmail]     = useState('')
  const [sending,   setSending]   = useState(false)
  const [error,     setError]     = useState('')
  const [success,   setSuccess]   = useState('')

  const load = useCallback(() => {
    if (!user) return
    apiGetFriends().then(data => setFriends(data.filter(f => f.status === 'accepted'))).catch(() => {})
    apiGetFriendRequests().then(data => setRequests(data.filter(r => r.direction === 'received'))).catch(() => {})
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
    try { await apiAcceptFriendRequest(id); load() } catch { return undefined }
  }

  async function handleRemove(id) {
    try { await apiRemoveFriend(id); load() } catch { return undefined }
  }

  return (
    <>
    <div className="battles">

          {/* Incoming requests */}
          {requests.length > 0 && (
            <section className="battles__section">
              <h2 className="battles__section-title">{t('friends.requests')}</h2>
              <ul className="battles__list">
                {requests.map((req, i) => (
                  <li
                    key={req.id}
                    className="battles__invite battles__card-enter"
                    style={{ '--card-enter-delay': `${Math.min(i, 7) * 22}ms` }}
                  >
                    <div className="battles__info">
                      <span className="battles__opponent">{req.friend.name}</span>
                      <span className="battles__meta">{req.friend.email}</span>
                    </div>
                    <div className="battles__actions">
                      <Button color="green" onClick={() => handleAccept(req.id)}>{t('battles.accept')}</Button>
                      <IconButton icon={<TrashIcon />} onClick={() => handleRemove(req.id)} aria-label={t('battles.decline')} />
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
                {friends.map((f, i) => (
                  <li
                    key={f.id}
                    className="battles__invite battles__card-enter"
                    style={{ '--card-enter-delay': `${Math.min(i, 7) * 22}ms` }}
                  >
                    <div className="battles__info">
                      <span className="battles__opponent">{f.friend.name}</span>
                    </div>
                    <div className="battles__actions">
                      <Button color="pink" icon={<SwordIcon />} onClick={() => navigate(`/battles/new/${f.id}`, { state: { friend: f.friend } })}>{t('battles.challenge')}</Button>
                      <Button color="muted" icon={<span className="battles__button-icon"><EyeIcon /></span>} onClick={() => navigate(`/friends/${f.id}`)}>{t('friends.view')}</Button>
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
              <Button color="blue" fullWidth disabled={sending || !email.trim()}>
                {sending ? t('friends.sending') : t('friends.send')}
              </Button>
            </form>
            {error   && <p className="battles__error">{error}</p>}
            {success && <p className="battles__success">{success}</p>}
          </section>

    </div>
    </>
  )
}
