import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../../../context/AuthContext'
import { useLang } from '../../../context/LangContext'
import { useSubscription } from '../../../context/SubscriptionContext'
import { apiGetPacks, apiGetDailyChallenges } from '@shared/api/challenges'
import { apiCreateGame } from '@shared/api/games'
import Banner from '../../../components/Banner'
import ChallengeCard from '../../../components/ChallengeCard'
import LockedOverlay from '../../../components/LockedOverlay'
import UpgradeDialog from '../../../components/UpgradeDialog'
import './ChallengesPage.scss'

const LockBadge = () => (
  <svg viewBox="0 0 10 12" width="10" height="12" fill="currentColor" shapeRendering="crispEdges" className="challenges__pack-lock">
    <rect x="2" y="0" width="6" height="2" />
    <rect x="2" y="2" width="2" height="3" />
    <rect x="6" y="2" width="2" height="3" />
    <rect x="0" y="5" width="10" height="7" />
  </svg>
)

const QuestionMark = () => (
  <svg viewBox="0 0 8 12" width="24" height="36" fill="currentColor" shapeRendering="crispEdges" className="challenges__pack-unknown" aria-hidden="true">
    <rect x="1" y="0" width="6" height="2" />
    <rect x="0" y="2" width="2" height="2" />
    <rect x="6" y="2" width="2" height="2" />
    <rect x="6" y="4" width="2" height="2" />
    <rect x="4" y="6" width="2" height="2" />
    <rect x="3" y="8" width="2" height="2" />
    <rect x="3" y="11" width="2" height="1" />
  </svg>
)

const PackArt = ({ locked }) => (
  <div className="challenges__pack-art" aria-hidden="true">
    <svg viewBox="0 0 48 64" shapeRendering="crispEdges" className="challenges__pack-wrapper">
      <path className="challenges__pack-shadow" d="M8 8h34v48H8zM10 6h30v2H10zM10 56h30v2H10z" />
      <path className="challenges__pack-face" d="M6 10h36v44H6zM8 8h32v2H8zM8 54h32v2H8z" />
      <path className="challenges__pack-highlight" d="M8 10h6v42H8zM14 8h10v2H14z" />
      <path className="challenges__pack-dark" d="M36 10h6v44h-6zM28 54h12v2H28z" />
      <path className="challenges__pack-crimp" d="M8 8h4v2H8zM16 8h4v2h-4zM24 8h4v2h-4zM32 8h4v2h-4zM8 54h4v2H8zM16 54h4v2h-4zM24 54h4v2h-4zM32 54h4v2h-4z" />
      <path className="challenges__pack-stripe" d="M6 26h36v12H6z" />
      <path className="challenges__pack-stripe-highlight" d="M8 26h6v12H8z" />
      <path className="challenges__pack-stripe-dark" d="M36 26h6v12h-6z" />
      <path className="challenges__pack-spark" d="M22 16h4v4h-4zM20 20h8v4h-8zM22 24h4v4h-4zM14 42h4v4h-4zM30 42h4v4h-4z" />
    </svg>
    {locked && <QuestionMark />}
  </div>
)

const SignUpBannerMessage = ({ t }) => {
  const parts = t('challenges.signUpBanner').split(/(\{packs\}|\{energy\})/)
  return (
    <>
      {parts.map((p, i) => {
        if (p === '{packs}') return <span key={i} className="banner__message-highlight">{t('challenges.signUpBannerPacks')}</span>
        if (p === '{energy}') return <span key={i} className="banner__message-highlight">{t('challenges.signUpBannerEnergy')}</span>
        return p
      })}
    </>
  )
}

export default function ChallengesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t }        = useLang()
  const { isActive, subscription } = useSubscription()
  const [packs,         setPacks]         = useState([])
  const [dailies,       setDailies]       = useState([])
  const [dailiesLoading, setDailiesLoading] = useState(true)
  const [upgradeOpen,   setUpgradeOpen]   = useState(false)
  const dailyCards = dailiesLoading && dailies.length === 0
    ? [{ id: 'daily-placeholder', difficulty: 'medium', completed: false, isPlaceholder: true }]
    : dailies
  const isGuest = !user || user.is_guest
  const showUpgradeBanner = !isGuest && !isActive && subscription !== undefined
  const showSignUpBanner = isGuest

  useEffect(() => {
    apiGetPacks().then(data => setPacks(data.filter(p => {
      const total = p.total_count ?? 0
      return total > 0 && !p.is_daily && !/daily/i.test(p.name)
    }))).catch(() => {})
    apiGetDailyChallenges()
      .then(setDailies)
      .catch(() => {})
      .finally(() => setDailiesLoading(false))
  }, [])

  async function playDaily(daily) {
    try {
      const game = await apiCreateGame({ challenge_id: daily.challenge_id })
      navigate(`/games/${game.id}`, {
        state: {
          label:      t('challenges.dailySection'),
          difficulty: daily.difficulty,
          guessLimit: daily.guess_limit,
        },
      })
    } catch {}
  }

  return (
    <>
    <div className="challenges">

      {dailyCards.length > 0 && (
        <section className="challenges__daily-section">
          <h2 className="challenges__section-title">{t('challenges.dailySection')}</h2>
          <div className="challenges__daily">
            {dailyCards.map(daily => (
              <ChallengeCard
                key={daily.id ?? daily.challenge_id}
                className={daily.isPlaceholder ? 'challenges__daily-placeholder' : undefined}
                type={daily.challenge_type}
                difficulty={daily.difficulty}
                label={t('challenges.dailySection')}
                subject={daily.subject}
                sticker={daily.sticker}
                icon={daily.icon}
                completed={daily.completed}
                freeBadge={isGuest && !daily.isPlaceholder ? t('challenges.playFree') : undefined}
                onClick={daily.isPlaceholder ? undefined : () => playDaily(daily)}
              />
            ))}
          </div>
        </section>
      )}

      {(showSignUpBanner || showUpgradeBanner) && (
        <Banner
          variant="cta"
          title={showSignUpBanner ? t('nav.signUp') : t('upgrade.title')}
          message={showSignUpBanner ? <SignUpBannerMessage t={t} /> : t('upgrade.perk2desc')}
          cta={showSignUpBanner ? t('register.submit') : t('upgrade.cta')}
          onCta={() => showSignUpBanner ? navigate('/register') : setUpgradeOpen(true)}
        />
      )}

      <section>
        <h2 className="challenges__section-title">{t('challenges.packsSection')}</h2>
        <div className="locked-wrap">
          <div className={isGuest ? 'locked-wrap__content' : undefined}>
            <div className="challenges__packs">
              {packs.map((pack, i) => {
                const total     = pack.total_count ?? 0
                const completed = pack.completed_count ?? pack.completed ?? null
                const pct       = completed != null && total > 0
                  ? Math.round((completed / total) * 100)
                  : null
                return (
                  <div
                    key={pack.id}
                    className={[
                      'challenges__pack-card',
                      'challenges__card-enter',
                      pack.is_locked && !pack.subscription_access && 'challenges__pack-card--locked',
                    ].filter(Boolean).join(' ')}
                    style={{ '--card-enter-delay': `${Math.min(i, 7) * 35}ms` }}
                    onClick={() => {
                      if (pack.subscription_access && !isActive) { setUpgradeOpen(true); return }
                      if (!pack.is_locked) navigate(`/packs/${pack.id}/challenges`)
                    }}
                  >
                    {pack.is_locked && <LockBadge />}
                    <PackArt locked={pack.is_locked} />
                    <div className="challenges__pack-copy">
                      <span className="challenges__pack-name">{pack.name}</span>
                      {pack.description && (
                        <span className="challenges__pack-description">{pack.description}</span>
                      )}
                    </div>
                    <span className="challenges__pack-count">
                      {completed != null ? `${completed}/${total}` : total}
                    </span>
                    {pct != null && (
                      <div className="challenges__progress">
                        <div className="challenges__progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          {isGuest && (
            <LockedOverlay
              title={t('challenges.lockedTitle')}
              message={t('challenges.lockedMessage')}
            />
          )}
        </div>
      </section>

    </div>

    {upgradeOpen && <UpgradeDialog onClose={() => setUpgradeOpen(false)} />}
    </>
  )
}
