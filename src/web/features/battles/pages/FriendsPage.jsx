import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useLang } from '../../../context/LangContext'
import { useFriends } from '../../../context/FriendsContext'
import { useMeQuery } from '@shared/api/users'
import {
  useSendFriendInviteMutation,
  useAcceptFriendRequestMutation,
  useRemoveFriendMutation,
} from '@shared/api/friends'
import Banner from '../../../components/Banner'
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

function getReferralUrl(code) {
  if (!code || typeof window === 'undefined') return ''
  return new URL(`/register?ref=${encodeURIComponent(code)}`, window.location.origin).toString()
}

function openShareWindow(url) {
  if (typeof window === 'undefined') return
  window.open(url, '_blank', 'noopener,noreferrer,width=720,height=640')
}

export default function FriendsPage() {
  const { t }      = useLang()
  const navigate   = useNavigate()
  const { friends, requests } = useFriends()
  const { data: me } = useMeQuery()

  const sendInviteMutation = useSendFriendInviteMutation()
  const acceptMutation = useAcceptFriendRequestMutation()
  const removeMutation = useRemoveFriendMutation()

  const [email,     setEmail]     = useState('')
  const [error,     setError]     = useState('')
  const [success,   setSuccess]   = useState('')
  const [copied,    setCopied]    = useState(false)

  const sending = sendInviteMutation.isPending
  const referralUrl = useMemo(() => getReferralUrl(me?.referral_code), [me?.referral_code])
  const shareText = t('friends.referralShareText')
  const encodedText = encodeURIComponent(shareText)
  const encodedUrl = encodeURIComponent(referralUrl)

  async function handleCopyReferral() {
    if (!referralUrl || typeof navigator === 'undefined') return
    try {
      await navigator.clipboard.writeText(referralUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setError(t('friends.referralCopyError'))
    }
  }

  async function handleSendInvite(e) {
    e.preventDefault()
    if (!email.trim()) return
    setError('')
    setSuccess('')
    try {
      await sendInviteMutation.mutateAsync(email.trim())
      setEmail('')
      setSuccess(t('friends.inviteSent'))
    } catch {
      setError(t('friends.inviteError'))
    }
  }

  function handleAccept(id) {
    acceptMutation.mutate(id)
  }

  function handleRemove(id) {
    removeMutation.mutate(id)
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

          {referralUrl && (
            <Banner
              variant="muted"
              title={t('friends.referralTitle')}
              message={t('friends.referralMessage')}
            >
              <div className="friends__referral">
                <div className="friends__referral-copy">
                  <input
                    className="friends__referral-url"
                    value={referralUrl}
                    readOnly
                    aria-label={t('friends.referralUrlLabel')}
                    onFocus={e => e.target.select()}
                  />
                  <Button color="blue" icon={null} onClick={handleCopyReferral}>
                    {copied ? t('friends.referralCopied') : t('friends.referralCopy')}
                  </Button>
                </div>
                <p className="friends__referral-share-title">{t('friends.referralShareTitle')}</p>
                <div className="friends__referral-share" aria-label={t('friends.referralShareTitle')}>
                  <Button
                    color="muted"
                    className="friends__referral-share-btn"
                    icon={null}
                    onClick={() => openShareWindow(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`)}
                  >
                    {t('game.shareX')}
                  </Button>
                  <Button
                    color="muted"
                    className="friends__referral-share-btn"
                    icon={null}
                    onClick={() => openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`)}
                  >
                    {t('game.shareFacebook')}
                  </Button>
                  <Button
                    color="muted"
                    className="friends__referral-share-btn"
                    icon={null}
                    onClick={() => openShareWindow(`https://wa.me/?text=${encodedText}%20${encodedUrl}`)}
                  >
                    {t('game.shareWhatsApp')}
                  </Button>
                  <Button
                    color="muted"
                    className="friends__referral-share-btn"
                    icon={null}
                    onClick={() => openShareWindow(`https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedText}`)}
                  >
                    {t('game.shareReddit')}
                  </Button>
                </div>
              </div>
            </Banner>
          )}

    </div>
    </>
  )
}
