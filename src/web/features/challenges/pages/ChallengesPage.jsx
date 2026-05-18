import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { useAuth } from '../../../context/AuthContext'
import { useLang } from '../../../context/LangContext'
import { useSubscription } from '../../../context/SubscriptionContext'
import { usePacksQuery, useDailyChallengesQuery } from '@shared/api/challenges'
import { useCreateGameMutation } from '@shared/api/games'
import Banner from '../../../components/Banner'
import ChallengeCard from '../../../components/ChallengeCard'
import LockedOverlay from '../../../components/LockedOverlay'
import UpgradeDialog from '../../../components/UpgradeDialog'
import { useDateLocale } from '../../../hooks/useDateLocale'
import { useOnlineStatus } from '../../../hooks/useOnlineStatus'
import { formatLocalizedDate } from '../../../utils/dateFormat'
import { useNotifications } from '../../../context/NotificationContext'
import './ChallengesPage.scss'

const INSTALL_BANNER_DISMISSED_UNTIL_KEY = 'whatdis_pwa_install_banner_dismissed_until'
const INSTALL_BANNER_DISMISS_MS = 7 * 24 * 60 * 60 * 1000

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

function isInstallBannerDismissed() {
  const dismissedUntil = Number(localStorage.getItem(INSTALL_BANNER_DISMISSED_UNTIL_KEY))
  return Number.isFinite(dismissedUntil) && dismissedUntil > Date.now()
}

function isRunningStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
}

export default function ChallengesPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { t }        = useLang()
  const { notify } = useNotifications()
  const isOnline = useOnlineStatus()
  const dateLocale = useDateLocale()
  const { isActive, subscription } = useSubscription()
  const [upgradeOpen,   setUpgradeOpen]   = useState(false)
  const [welcomeUpgradeOpen, setWelcomeUpgradeOpen] = useState(!!location.state?.promptUpgrade)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [installBannerDismissed, setInstallBannerDismissed] = useState(isInstallBannerDismissed)
  const [isPwaInstalled, setIsPwaInstalled] = useState(isRunningStandalone)

  useEffect(() => {
    if (location.state?.promptUpgrade) {
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.pathname, location.state?.promptUpgrade, navigate])

  useEffect(() => {
    const displayMode = window.matchMedia('(display-mode: standalone)')

    function syncInstalledState() {
      const installed = isRunningStandalone()
      setIsPwaInstalled(installed)
      if (installed) {
        setInstallPrompt(null)
      }
    }

    function handleBeforeInstallPrompt(event) {
      event.preventDefault()
      setInstallPrompt(event)
    }

    function handleAppInstalled() {
      setInstallPrompt(null)
      setIsPwaInstalled(true)
    }

    syncInstalledState()
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    displayMode.addEventListener?.('change', syncInstalledState)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      displayMode.removeEventListener?.('change', syncInstalledState)
    }
  }, [])

  const { data: allPacks = [] } = usePacksQuery({ enabled: Boolean(user) })
  const { data: dailies = [], isLoading: dailiesLoading } = useDailyChallengesQuery()
  const createGameMutation = useCreateGameMutation()

  const packs = useMemo(() => allPacks.filter(p => {
    const total = p.total_count ?? 0
    return total > 0 && !p.is_daily && !/daily/i.test(p.name) && p.is_battle !== true
  }), [allPacks])

  const dailyCards = dailiesLoading && dailies.length === 0
    ? [{ id: 'daily-placeholder', difficulty: 'medium', completed: false, isPlaceholder: true }]
    : dailies
  const isGuest = !user || user.is_guest
  const showUpgradeBanner = !isGuest && !isActive && subscription !== undefined
  const showSignUpBanner = isGuest
  const showInstallBanner = !isPwaInstalled && Boolean(installPrompt) && !installBannerDismissed
  const dailyDate = formatLocalizedDate(new Date(), dateLocale)

  function dismissInstallBanner() {
    localStorage.setItem(
      INSTALL_BANNER_DISMISSED_UNTIL_KEY,
      String(Date.now() + INSTALL_BANNER_DISMISS_MS),
    )
    setInstallBannerDismissed(true)
  }

  async function installPwa() {
    if (!installPrompt) return

    try {
      installPrompt.prompt()
      const choice = await installPrompt.userChoice

      if (choice?.outcome !== 'accepted') {
        dismissInstallBanner()
      }
    } catch {
      dismissInstallBanner()
    } finally {
      setInstallPrompt(null)
    }
  }

  async function playDaily(daily) {
    if (!isOnline) {
      notify({
        key: 'network-offline',
        title: t('notifications.offlineTitle'),
        message: t('notifications.offlineMessage'),
        duration: 0,
      })
      return
    }
    try {
      const game = await createGameMutation.mutateAsync({ challenge_id: daily.challenge_id })
      navigate(`/games/${game.id}`, {
        state: {
          label:      t('challenges.dailySection'),
          difficulty: daily.difficulty,
        },
      })
    } catch {
      // Game creation failures are ignored here; the card remains playable.
    }
  }

  return (
    <>
    <div className="challenges">

      {dailyCards.length > 0 && (
        <section className="challenges__daily-section" data-tour="daily">
          <div className="challenges__section-heading">
            <h2 className="challenges__section-title">{t('challenges.dailySection')}</h2>
            <p className="challenges__section-date">{dailyDate}</p>
          </div>
          <div className="challenges__daily">
            {dailyCards.map(daily => (
              <ChallengeCard
                key={daily.id ?? daily.challenge_id}
                className={daily.isPlaceholder ? 'challenges__daily-placeholder' : undefined}
                type={daily.challenge_type}
                difficulty={daily.difficulty}
                label={t('challenges.dailySection')}
                subject={daily.subject}
                subjectPlacement="below"
                sticker={daily.sticker}
                icon={daily.icon}
                completed={daily.completed}
                disabled={!isOnline}
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

      {showInstallBanner && (
        <Banner
          variant="muted"
          title={t('pwa.installTitle')}
          message={t('pwa.installMessage')}
          cta={t('pwa.installCta')}
          onCta={installPwa}
          dismissible
          onDismiss={dismissInstallBanner}
          dismissLabel={t('pwa.dismiss')}
        />
      )}

      <section>
        <h2 className="challenges__section-title">{t('challenges.packsSection')}</h2>
        <div className="locked-wrap">
          <div className={isGuest ? 'locked-wrap__content' : undefined}>
            <div className="challenges__packs" data-tour="packs">
              {packs.map((pack, i) => {
                const total     = pack.total_count ?? 0
                const completed = pack.completed_count ?? pack.completed ?? null
                return (
                  <div
                    key={pack.id}
                    className={[
                      'challenges__pack-card',
                      'challenges__card-enter',
                      pack.is_locked && pack.is_exclusive && 'challenges__pack-card--locked',
                    ].filter(Boolean).join(' ')}
                    style={{ '--card-enter-delay': `${Math.min(i, 7) * 35}ms` }}
                    onClick={() => {
                      if (pack.is_locked && pack.subscription_access) { setUpgradeOpen(true); return }
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
                    {completed != null && total > 0 && (
                      <div className="challenges__progress">
                        <div
                          className="challenges__progress-fill"
                          style={{ width: `${Math.min(100, (completed / total) * 100)}%` }}
                        />
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
    {welcomeUpgradeOpen && <UpgradeDialog fullscreen onClose={() => setWelcomeUpgradeOpen(false)} />}
    </>
  )
}
