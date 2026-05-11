import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../../../context/AuthContext'
import { useLang } from '../../../context/LangContext'
import { apiGetPacks, apiGetDailyChallenges } from '@shared/api/challenges'
import { apiCreateGame } from '@shared/api/games'
import Button from '../../../components/Button'
import ChallengeCard from '../../../components/ChallengeCard'
import LockedOverlay from '../../../components/LockedOverlay'
import './ChallengesPage.scss'

export default function ChallengesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t }    = useLang()
  const [packs,   setPacks]   = useState([])
  const [dailies, setDailies] = useState([])

  useEffect(() => {
    apiGetPacks().then(data => setPacks(data.filter(p => !p.is_daily && !/daily/i.test(p.name)))).catch(() => {})
    apiGetDailyChallenges().then(setDailies).catch(() => {})
  }, [])

  const TYPE_LABEL = {
    person: t('challenges.dailyPerson'),
    object: t('challenges.dailyObject'),
  }

  async function playDaily(daily) {
    if (!user) { navigate('/register'); return }
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
                    className="challenges__pack-card"
                    onClick={() => navigate(`/packs/${pack.id}/challenges`)}
                  >
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
  )
}
