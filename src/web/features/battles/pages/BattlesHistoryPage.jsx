import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useLang } from '../../../context/LangContext'
import { apiGetBattles } from '@shared/api/battles'
import './BattlesPage.scss'

function battleOpponent(battle, userId) {
  const opp = battle.player1?.id === userId ? battle.player2 : battle.player1
  return opp?.name ?? opp?.username ?? '?'
}

function battleScores(battle, userId) {
  if (battle.player1?.id === userId) {
    return [battle.player1_score ?? 0, battle.player2_score ?? 0]
  }
  return [battle.player2_score ?? 0, battle.player1_score ?? 0]
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
    apiGetBattles().then(all => setBattles(all.filter(b => b.status === 'finished'))).catch(() => {})
  }, [user])

  return (
    <div className="battles">
      <section className="battles__section">
            <h2 className="battles__section-title">{t('battles.tabHistory')}</h2>
            {battles.length === 0 ? (
              <p className="battles__empty">{t('battles.noHistory')}</p>
            ) : (
              <ul className="battles__list">
                {battles.map((battle, i) => {
                  const [myScore, theirScore] = battleScores(battle, user?.id)
                  const won = myScore > theirScore
                  const draw = myScore === theirScore
                  return (
                    <li
                      key={battle.id}
                      className="battles__battle battles__battle--history battles__card-enter"
                      style={{ '--card-enter-delay': `${Math.min(i, 7) * 22}ms` }}
                    >
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
  )
}
