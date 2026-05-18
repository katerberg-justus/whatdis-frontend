import { useParams, useNavigate, useLocation } from 'react-router'
import { useLang } from '../../../context/LangContext'
import { useNotifications } from '../../../context/NotificationContext'
import { useOnlineStatus } from '../../../hooks/useOnlineStatus'
import { usePackQuery } from '@shared/api/challenges'
import { useFriendsQuery } from '@shared/api/friends'
import {
  useBattlePackChallengesQuery,
  useCreateBattleMutation,
} from '@shared/api/battles'
import Button from '../../../components/Button'
import ChallengeCard from '../../../components/ChallengeCard'
import '../../packs/pages/PackChallengesPage.scss'
import './PickBattlePage.scss'

export default function PickBattleChallengePage() {
  const { friendshipId, packId } = useParams()
  const navigate                 = useNavigate()
  const location                 = useLocation()
  const { t }                    = useLang()
  const { notify }               = useNotifications()
  const isOnline                 = useOnlineStatus()

  const stateFriend = location.state?.friend ?? null
  const { data: friendsList = [] } = useFriendsQuery({ enabled: !stateFriend })
  const friend = stateFriend
    ?? friendsList.find(f => f.id === friendshipId)?.friend
    ?? null

  const { data: fetchedPack, error: packError } = usePackQuery(packId, {
    enabled: Boolean(packId) && !location.state?.pack,
  })
  const pack = location.state?.pack ?? fetchedPack ?? null

  const { data: challenges = [], error: challengesError } = useBattlePackChallengesQuery(
    packId,
    friend?.id,
  )

  const createBattleMutation = useCreateBattleMutation()
  const error = Boolean(packError || challengesError)

  async function handleChallengeClick(challenge) {
    if (createBattleMutation.isPending || !friend || challenge.battle_completed_by_participant) return
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
      await createBattleMutation.mutateAsync({
        challenge_id: challenge.id,
        opponent_id:  friend.id,
      })
      navigate('/battles')
    } catch { /* swallow */ }
  }

  if (error) return <p className="pack-challenges__not-found">Pack not found.</p>

  const friendName = friend?.name ?? ''

  return (
    <div className="pack-challenges pick-battle">

      <div className="pack-challenges__header">
        <Button color="muted" icon={null} onClick={() => navigate(`/battles/new/${friendshipId}`, { state: { friend } })}>&lt; {t('battles.back')}</Button>
        <div className="pack-challenges__heading">
          <h2 className="pack-challenges__title">{pack?.name ?? ''}</h2>
          {pack?.description && <p className="pack-challenges__description">{pack.description}</p>}
        </div>
      </div>

      <p className="pick-battle__against">
        {t('battles.pickingAgainst')} "{friendName}"
      </p>

      <div className="pack-challenges__grid">
        {challenges.map((challenge, i) => (
          <ChallengeCard
            key={challenge.id}
            className="pack-challenges__card-enter"
            style={{ '--card-enter-delay': `${Math.min(i, 7) * 35}ms` }}
            type={challenge.challenge_type ?? 'object'}
            difficulty={challenge.difficulty}
            label={`#${i + 1}`}
            subject={challenge.subject}
            sticker={challenge.sticker}
            icon={challenge.icon}
            locked={challenge.is_locked}
            completed={challenge.completed}
            disabled={challenge.battle_completed_by_participant || !isOnline}
            onClick={() => handleChallengeClick(challenge)}
          />
        ))}
      </div>

    </div>
  )
}
