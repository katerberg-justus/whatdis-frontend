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

const BattlePageIcon = ({ type }) => {
  const icons = {
    invite: (
      <>
        <rect x="2" y="3" width="12" height="10" />
        <rect x="4" y="5" width="2" height="2" fill="var(--battle-icon-cutout)" />
        <rect x="10" y="5" width="2" height="2" fill="var(--battle-icon-cutout)" />
        <rect x="6" y="8" width="4" height="1" fill="var(--battle-icon-cutout)" />
        <rect x="5" y="10" width="6" height="1" fill="var(--battle-icon-cutout)" />
      </>
    ),
    battle: (
      <>
        <rect x="10" y="1" width="3" height="3" />
        <rect x="9" y="4" width="2" height="2" />
        <rect x="7" y="6" width="2" height="2" />
        <rect x="5" y="8" width="2" height="2" />
        <rect x="3" y="10" width="2" height="2" />
        <rect x="2" y="12" width="2" height="2" />
        <rect x="5" y="11" width="2" height="2" />
        <rect x="1" y="14" width="3" height="1" />
      </>
    ),
  }[type]

  return (
    <svg
      className={`battles__pixel-icon battles__pixel-icon--${type}`}
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {icons}
    </svg>
  )
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
              <h2 className="battles__section-title">
                <BattlePageIcon type="invite" />
                <span>{t('battles.pendingInvites')}</span>
              </h2>
              <ul className="battles__list">
                {invites.map((battle) => (
                  <li key={battle.id} className="battles__invite">
                    <span className="battles__card-icon">
                      <BattlePageIcon type="invite" />
                    </span>
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
                      <span className="battles__card-icon">
                        <BattlePageIcon type="battle" />
                      </span>
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
