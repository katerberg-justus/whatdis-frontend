import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../../../context/AuthContext'
import { useLang } from '../../../context/LangContext'
import { useSubscription } from '../../../context/SubscriptionContext'
import { apiGetPacks, apiGetDailyChallenges } from '@shared/api/challenges'
import { apiCreateGame } from '@shared/api/games'
import Button from '../../../components/Button'
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
  <svg viewBox="0 0 8 12" width="24" height="36" fill="currentColor" shapeRendering="crispEdges" className="challenges__pack-unknown">
    <rect x="1" y="0" width="6" height="2" />
    <rect x="0" y="2" width="2" height="2" />
    <rect x="6" y="2" width="2" height="2" />
    <rect x="6" y="4" width="2" height="2" />
    <rect x="4" y="6" width="2" height="2" />
    <rect x="3" y="8" width="2" height="2" />
    <rect x="3" y="11" width="2" height="1" />
  </svg>
)

export default function ChallengesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t }        = useLang()
  const { isActive } = useSubscription()
  const [packs,         setPacks]         = useState([])
  const [dailies,       setDailies]       = useState([])
  const [upgradeOpen,   setUpgradeOpen]   = useState(false)

  useEffect(() => {
    apiGetPacks().then(data => setPacks(data.filter(p => !p.is_daily && !/daily/i.test(p.name)))).catch(() => {})
    apiGetDailyChallenges().then(setDailies).catch(() => {})
  }, [])

  const TYPE_LABEL = {
    person: t('challenges.dailyPerson'),
    object: t('challenges.dailyObject'),
  }

  async function playDaily(daily) {
    try {
      const game = await apiCreateGame({ challenge_id: daily.challenge_id })
      navigate(`/games/${game.id}`, {
        state: {
          label:      TYPE_LABEL[daily.challenge_type] ?? `Daily ${daily.challenge_type}`,
          difficulty: daily.difficulty,
          guessLimit: daily.guess_limit,
        },
      })
    } catch {}
  }

  return (
    <>
    <div className="challenges">

      {dailies.length > 0 && (
        <section>
          <h2 className="challenges__section-title">{t('challenges.dailySection')}</h2>
          <div className="challenges__daily">
            {dailies.map((daily) => (
              <ChallengeCard
                key={daily.id}
                type={daily.challenge_type}
                difficulty={daily.difficulty}
                label={TYPE_LABEL[daily.challenge_type] ?? `Daily ${daily.challenge_type}`}
                onClick={() => playDaily(daily)}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="challenges__section-title">{t('challenges.packsSection')}</h2>
        <div className="locked-wrap">
          <div className={user ? undefined : 'locked-wrap__content'}>
            <div className="challenges__packs">
              {packs.map((pack) => {
                const total     = pack.total_count ?? 0
                const completed = pack.completed_count ?? pack.completed ?? null
                const pct       = completed != null && total > 0
                  ? Math.round((completed / total) * 100)
                  : null
                return (
                  <div
                    key={pack.id}
                    className={['challenges__pack-card', pack.is_locked && !pack.subscription_access && 'challenges__pack-card--locked'].filter(Boolean).join(' ')}
                    onClick={() => {
                      if (pack.subscription_access && !isActive) { setUpgradeOpen(true); return }
                      if (!pack.is_locked) navigate(`/packs/${pack.id}/challenges`)
                    }}
                  >
                    {pack.is_locked && <LockBadge />}
                    {pack.is_locked && <QuestionMark />}
                    <span className="challenges__pack-name">{pack.name}</span>
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
          {!user && (
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
