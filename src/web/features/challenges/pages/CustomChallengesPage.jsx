import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../../../context/AuthContext'
import { useLang } from '../../../context/LangContext'
import { useMyCustomChallengesQuery } from '@shared/api/customChallenges'
import Button from '../../../components/Button'
import ChallengeCard from '../../../components/ChallengeCard'
import IconButton from '../../../components/IconButton'
import LockedOverlay from '../../../components/LockedOverlay'
import Dialog from '../../../components/Dialog'
import { LinkIcon, ShareIcon } from '../../../components/icons'
import './CustomChallengesPage.scss'

const buildShareUrl = (token) => `${window.location.origin}/challenges/custom/share/${token}`

function openShareWindow(url) {
  if (typeof window === 'undefined') return
  window.open(url, '_blank', 'noopener,noreferrer,width=720,height=640')
}

export default function CustomChallengesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t }    = useLang()

  const isGuest = !user || user.is_guest
  const { data: challenges = [], isLoading } = useMyCustomChallengesQuery({ enabled: !isGuest })

  const [shareToken, setShareToken] = useState(null)

  async function copyShare(token) {
    try {
      await navigator.clipboard.writeText(buildShareUrl(token))
    } catch {
      // Clipboard not available; ignored.
    }
  }

  const shareUrl   = shareToken ? buildShareUrl(shareToken) : ''
  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedTxt = encodeURIComponent(t('challenges.customShareText'))

  return (
    <>
      <div className="custom-challenges">
        <div className="locked-wrap">
          <div className={isGuest ? 'locked-wrap__content' : undefined}>
            {!isLoading && challenges.length === 0 && (
              <p className="custom-challenges__empty">{t('challenges.customEmpty')}</p>
            )}

            <div className="custom-challenges__grid">
              {challenges.map((c, i) => (
                <div
                  key={c.id}
                  className="custom-challenges__cell custom-challenges__card-enter"
                  style={{ '--card-enter-delay': `${Math.min(i, 7) * 35}ms` }}
                >
                  <ChallengeCard
                    difficulty={c.difficulty}
                    label={c.subject}
                    onClick={() => copyShare(c.share_token)}
                  />
                  <div className="custom-challenges__actions">
                    <IconButton
                      className="icon-btn--small"
                      icon={<LinkIcon />}
                      onClick={(e) => { e.stopPropagation(); copyShare(c.share_token) }}
                      aria-label={t('challenges.customCopyLink')}
                    />
                    <IconButton
                      className="icon-btn--small"
                      icon={<ShareIcon />}
                      onClick={(e) => { e.stopPropagation(); setShareToken(c.share_token) }}
                      aria-label={t('game.shareTitle')}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {isGuest && (
            <LockedOverlay
              title={t('challenges.customLockedTitle')}
              message={t('challenges.customLockedMessage')}
            />
          )}
        </div>
      </div>

      <div className="custom-challenges__footer">
        <Button
          color="pink"
          fullWidth
          onClick={() => navigate(isGuest ? '/register' : '/challenges/custom/new')}
        >
          {t('challenges.customCreate')}
        </Button>
      </div>

      {shareToken && (
        <Dialog title={t('game.shareTitle')} onClose={() => setShareToken(null)}>
          <div className="custom-challenges__share-stack" aria-label={t('game.shareTitle')}>
            <Button
              fullWidth
              color="muted"
              icon={null}
              onClick={() => openShareWindow(`https://twitter.com/intent/tweet?text=${encodedTxt}&url=${encodedUrl}`)}
            >
              {t('game.shareX')}
            </Button>
            <Button
              fullWidth
              color="muted"
              icon={null}
              onClick={() => openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTxt}`)}
            >
              {t('game.shareFacebook')}
            </Button>
            <Button
              fullWidth
              color="muted"
              icon={null}
              onClick={() => openShareWindow(`https://wa.me/?text=${encodedTxt}%20${encodedUrl}`)}
            >
              {t('game.shareWhatsApp')}
            </Button>
            <Button
              fullWidth
              color="muted"
              icon={null}
              onClick={() => openShareWindow(`https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTxt}`)}
            >
              {t('game.shareReddit')}
            </Button>
          </div>
        </Dialog>
      )}
    </>
  )
}
