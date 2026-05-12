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
import ChallengeDialog from '../../../components/ChallengeDialog'
import Input from '../../../components/Input'
import './BattlesPage.scss'

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
  const [challenging, setChallenging] = useState(null)

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
    try { await apiAcceptFriendRequest(id); load() } catch {}
  }

  async function handleRemove(id) {
    try { await apiRemoveFriend(id); load() } catch {}
  }

  return (
    <>
    <div className="battles">

          {/* Incoming requests */}
          {requests.length > 0 && (
            <section className="battles__section">
              <h2 className="battles__section-title">{t('friends.requests')}</h2>
              <ul className="battles__list">
                {requests.map((req) => (
                  <li key={req.id} className="battles__invite">
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
                {friends.map((f) => (
                  <li key={f.id} className="battles__invite">
                    <div className="battles__info">
                      <span className="battles__opponent">{f.friend.name}</span>
                    </div>
                    <div className="battles__actions">
                      <Button color="pink" icon={null} onClick={() => setChallenging(f)}>{t('battles.challenge')}</Button>
                      <IconButton icon={<EyeIcon />} onClick={() => navigate(`/friends/${f.id}`)} />
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

    {challenging && (
      <ChallengeDialog
        friend={challenging.friend}
        onClose={() => setChallenging(null)}
      />
    )}
    </>
  )
}
