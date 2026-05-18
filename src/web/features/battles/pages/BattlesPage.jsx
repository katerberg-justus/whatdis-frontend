import { useNavigate } from 'react-router'
import { useAuth } from '../../../context/AuthContext'
import { useLang } from '../../../context/LangContext'
import { useBattles } from '../../../context/BattlesContext'
import { useNotifications } from '../../../context/NotificationContext'
import { useOnlineStatus } from '../../../hooks/useOnlineStatus'
import { useAcceptBattleMutation, useDeclineBattleMutation } from '@shared/api/battles'
import Button from '../../../components/Button'
import './BattlesPage.scss'

const CheckIcon = () => (
  <svg viewBox="0 0 11 8" width="11" height="8" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true" className="btn__chevron">
    <rect x="0" y="4" width="3" height="2" />
    <rect x="2" y="6" width="3" height="2" />
    <rect x="4" y="4" width="3" height="2" />
    <rect x="6" y="2" width="3" height="2" />
    <rect x="8" y="0" width="3" height="2" />
  </svg>
)

const CrossIcon = () => (
  <svg viewBox="0 0 8 8" width="11" height="8" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true" className="btn__chevron" preserveAspectRatio="xMidYMid meet">
    <rect x="0" y="0" width="2" height="2" />
    <rect x="2" y="2" width="2" height="2" />
    <rect x="4" y="4" width="2" height="2" />
    <rect x="6" y="6" width="2" height="2" />
    <rect x="6" y="0" width="2" height="2" />
    <rect x="4" y="2" width="2" height="2" />
    <rect x="2" y="4" width="2" height="2" />
    <rect x="0" y="6" width="2" height="2" />
  </svg>
)

const DIFF_LABEL_KEY = { easy: 'game.diffEasy', medium: 'game.diffMedium', hard: 'game.diffHard' }

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

function difficultyLabel(t, difficulty) {
  return t(DIFF_LABEL_KEY[difficulty]) ?? difficulty
}

export default function BattlesPage() {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const { t }     = useLang()
  const { notify } = useNotifications()
  const isOnline = useOnlineStatus()
  const { battles } = useBattles()
  const acceptMutation = useAcceptBattleMutation()
  const declineMutation = useDeclineBattleMutation()

  const invites = battles.filter(b => b.status === 'pending' && b.player2?.id === user?.id)
  const sentInvites = battles.filter(b => b.status === 'pending' && b.player1?.id === user?.id)
  const ongoing = battles.filter(b => b.status === 'active')

  function handleAccept(battleId) {
    if (!isOnline) {
      notify({
        key: 'network-offline',
        title: t('notifications.offlineTitle'),
        message: t('notifications.offlineMessage'),
        duration: 0,
      })
      return
    }
    acceptMutation.mutate(battleId)
  }

  function handleDecline(battleId) {
    if (!isOnline) {
      notify({
        key: 'network-offline',
        title: t('notifications.offlineTitle'),
        message: t('notifications.offlineMessage'),
        duration: 0,
      })
      return
    }
    declineMutation.mutate(battleId)
  }

  return (
    <div className="battles">

          {invites.length > 0 && (
            <section className="battles__section">
              <h2 className="battles__section-title">
                <span>{t('battles.pendingInvites')}</span>
              </h2>
              <ul className="battles__list">
                {invites.map((battle, i) => (
                  <li
                    key={battle.id}
                    className="battles__invite battles__card-enter"
                    style={{ '--card-enter-delay': `${Math.min(i, 7) * 22}ms` }}
                  >
                    <div className="battles__badges">
                      <span className={`battles__badge battles__badge--${battle.difficulty}`}>
                        {difficultyLabel(t, battle.difficulty)}
                      </span>
                    </div>
                    <div className="battles__info">
                      <span className="battles__opponent">{battleOpponent(battle, user?.id)}</span>
                      <span className="battles__meta">
                        {battle.challenge_pack?.name ?? battle.pack?.name ?? ''}
                      </span>
                    </div>
                    <div className="battles__actions">
                      <Button color="green" icon={<CheckIcon />} onClick={() => handleAccept(battle.id)} disabled={!isOnline}>{t('battles.accept')}</Button>
                      <Button color="muted" icon={<CrossIcon />} onClick={() => handleDecline(battle.id)} disabled={!isOnline}>{t('battles.decline')}</Button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {sentInvites.length > 0 && (
            <section className="battles__section">
              <h2 className="battles__section-title">
                <span>{t('battles.sentInvites')}</span>
              </h2>
              <ul className="battles__list">
                {sentInvites.map((battle, i) => (
                  <li
                    key={battle.id}
                    className="battles__invite battles__card-enter"
                    style={{ '--card-enter-delay': `${Math.min(i, 7) * 22}ms` }}
                  >
                    <div className="battles__badges">
                      <span className="battles__tag battles__tag--blue">
                        {t('battles.waitingTag')}
                      </span>
                      <span className={`battles__badge battles__badge--${battle.difficulty}`}>
                        {difficultyLabel(t, battle.difficulty)}
                      </span>
                    </div>
                    <div className="battles__info">
                      <span className="battles__opponent">{battleOpponent(battle, user?.id)}</span>
                      <span className="battles__meta">
                        {battle.challenge_pack?.name ?? battle.pack?.name ?? ''}
                      </span>
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
                {ongoing.map((battle, i) => {
                  const [myScore, theirScore] = battleScores(battle, user?.id)
                  const myTurn = battle.current_turn_id === user?.id
                  return (
                    <li
                      key={battle.id}
                      className="battles__battle battles__card-enter"
                      style={{ '--card-enter-delay': `${Math.min(i, 7) * 22}ms` }}
                      onClick={() => navigate(`/battles/${battle.id}`)}
                    >
                      <div className="battles__badges">
                        {myTurn && (
                          <span className="battles__tag battles__tag--pink">
                            {t('battles.yourTurn')}
                          </span>
                        )}
                        <span className={`battles__badge battles__badge--${battle.difficulty}`}>
                          {difficultyLabel(t, battle.difficulty)}
                        </span>
                      </div>
                      <div className="battles__info">
                        <span className="battles__opponent">{battleOpponent(battle, user?.id)}</span>
                        <span className="battles__meta">
                          {battle.challenge_pack?.name ?? battle.pack?.name ?? ''}
                        </span>
                        <span className="battles__score">{myScore} – {theirScore}</span>
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
