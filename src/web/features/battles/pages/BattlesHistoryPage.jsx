import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useLang } from '../../../context/LangContext'
import { apiGetBattles } from '@shared/api/battles'
import LockedOverlay from '../../../components/LockedOverlay'
import './BattlesPage.scss'

function battleOpponent(battle, userId) {
  return battle.challenger?.id === userId
    ? battle.challenged?.username
    : battle.challenger?.username
}

function battleScores(battle, userId) {
  if (battle.challenger?.id === userId) {
    return [battle.challenger_score ?? 0, battle.challenged_score ?? 0]
  }
  return [battle.challenged_score ?? 0, battle.challenger_score ?? 0]
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function BattlesHistoryPage() {
  const { user } = useAuth()
  const { t }    = useLang()
  const [battles, setBattles] = useState([])

  useEffect(() => {
    if (!user) return
    apiGetBattles().then(all => setBattles(all.filter(b => b.status === 'completed'))).catch(() => {})
  }, [user])

  return (
    <div className="battles">
      <div className="locked-wrap">
        <div className={user ? undefined : 'locked-wrap__content'}>
          <section className="battles__section">
            <h2 className="battles__section-title">{t('battles.tabHistory')}</h2>
            {battles.length === 0 ? (
              <p className="battles__empty">{t('battles.noHistory')}</p>
            ) : (
              <ul className="battles__list">
                {battles.map((battle) => {
                  const [myScore, theirScore] = battleScores(battle, user?.id)
                  const won = myScore > theirScore
                  const draw = myScore === theirScore
                  return (
                    <li key={battle.id} className="battles__battle battles__battle--history">
                      <div className="battles__info">
                        <span className="battles__opponent">{battleOpponent(battle, user?.id)}</span>
                        <span className="battles__meta">
                          {battle.challenge_pack?.name ?? battle.pack?.name ?? ''}
                          {battle.completed_at && (
                            <span>{formatDate(battle.completed_at)}</span>
                          )}
                        </span>
                      </div>
                      <div className="battles__status">
                        <span className="battles__score">{myScore} – {theirScore}</span>
                        <span className={`battles__result battles__result--${draw ? 'draw' : won ? 'win' : 'loss'}`}>
                          {draw ? t('battles.draw') : won ? t('battles.win') : t('battles.loss')}
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
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
