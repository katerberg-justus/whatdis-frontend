import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../../../context/AuthContext'
import { useLang } from '../../../context/LangContext'
import { apiGetBattles, apiAcceptBattle, apiDeclineBattle } from '@shared/api/battles'
import Button from '../../../components/Button'
import './BattlesPage.scss'

function battleOpponent(battle, userId) {
  const opp = battle.challenger?.id === userId ? battle.challenged : battle.challenger
  return opp?.name ?? opp?.username
}

function battleScores(battle, userId) {
  if (battle.challenger?.id === userId) {
    return [battle.challenger_score ?? 0, battle.challenged_score ?? 0]
  }
  return [battle.challenged_score ?? 0, battle.challenger_score ?? 0]
}

export default function BattlesPage() {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const { t }     = useLang()
  const [battles, setBattles] = useState([])

  const loadBattles = useCallback(() => {
    if (!user) return
    apiGetBattles().then(setBattles).catch(() => {})
  }, [user])

  useEffect(() => { loadBattles() }, [loadBattles])

  const invites = battles.filter(b => b.status === 'pending' && b.challenged?.id === user?.id)
  const ongoing = battles.filter(b => b.status === 'active')

  async function handleAccept(battleId) {
    try { await apiAcceptBattle(battleId); loadBattles() } catch {}
  }

  async function handleDecline(battleId) {
    try { await apiDeclineBattle(battleId); loadBattles() } catch {}
  }

  return (
    <div className="battles">

          {invites.length > 0 && (
            <section className="battles__section">
              <h2 className="battles__section-title">{t('battles.pendingInvites')}</h2>
              <ul className="battles__list">
                {invites.map((battle) => (
                  <li key={battle.id} className="battles__invite">
                    <div className="battles__info">
                      <span className="battles__opponent">{battleOpponent(battle, user?.id)}</span>
                      <span className="battles__meta">
                        {battle.challenge_pack?.name ?? battle.pack?.name ?? ''}
                        <span className={`battles__diff battles__diff--${battle.difficulty}`}>
                          {battle.difficulty}
                        </span>
                      </span>
                    </div>
                    <div className="battles__actions">
                      <Button color="green" onClick={() => handleAccept(battle.id)}>{t('battles.accept')}</Button>
                      <Button color="muted" onClick={() => handleDecline(battle.id)}>{t('battles.decline')}</Button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="battles__section">
            <h2 className="battles__section-title">{t('battles.ongoing')}</h2>
            {ongoing.length === 0 ? (
              <p className="battles__empty">{t('battles.noOngoing')}</p>
            ) : (
              <ul className="battles__list">
                {ongoing.map((battle) => {
                  const [myScore, theirScore] = battleScores(battle, user?.id)
                  const myTurn = battle.current_player_id === user?.id
                  return (
                    <li
                      key={battle.id}
                      className="battles__battle"
                      onClick={() => navigate(`/battles/${battle.id}`)}
                    >
                      <div className="battles__info">
                        <span className="battles__opponent">{battleOpponent(battle, user?.id)}</span>
                        <span className="battles__meta">
                          {battle.challenge_pack?.name ?? battle.pack?.name ?? ''}
                          <span className={`battles__diff battles__diff--${battle.difficulty}`}>
                            {battle.difficulty}
                          </span>
                        </span>
                      </div>
                      <div className="battles__status">
                        <span className="battles__score">{myScore} – {theirScore}</span>
                        {battle.current_player_id != null && (
                          <span className={`battles__turn battles__turn--${myTurn ? 'yours' : 'theirs'}`}>
                            {myTurn ? t('battles.yourTurn') : t('battles.theirTurn')}
                          </span>
                        )}
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
