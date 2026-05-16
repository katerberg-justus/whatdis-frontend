import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router'
import { useLang } from '../../../context/LangContext'
import { apiGetPack } from '@shared/api/challenges'
import { apiGetFriends } from '@shared/api/friends'
import { apiCreateBattle, apiGetBattlePackChallenges } from '@shared/api/battles'
import Button from '../../../components/Button'
import ChallengeCard from '../../../components/ChallengeCard'
import '../../packs/pages/PackChallengesPage.scss'
import './PickBattlePage.scss'

export default function PickBattleChallengePage() {
  const { friendshipId, packId } = useParams()
  const navigate                 = useNavigate()
  const location                 = useLocation()
  const { t }                    = useLang()

  const [friend,     setFriend]     = useState(location.state?.friend ?? null)
  const [pack,       setPack]       = useState(location.state?.pack ?? null)
  const [challenges, setChallenges] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState(false)

  useEffect(() => {
    if (!friend) {
      apiGetFriends()
        .then(data => {
          const match = data.find(f => f.id === friendshipId)
          if (match) setFriend(match.friend)
        })
        .catch(() => {})
    }
  }, [friendshipId, friend])

  useEffect(() => {
    if (pack) return
    apiGetPack(packId)
      .then(setPack)
      .catch(() => setError(true))
  }, [packId, pack])

  useEffect(() => {
    if (!friend?.id) return
    apiGetBattlePackChallenges(packId, friend.id)
      .then(setChallenges)
      .catch(() => setError(true))
  }, [packId, friend?.id])

  async function handleChallengeClick(challenge) {
    if (submitting || !friend || challenge.battle_completed_by_participant) return
    setSubmitting(true)
    try {
      await apiCreateBattle({
        challenge_id: challenge.id,
        opponent_id:  friend.id,
      })
      navigate('/battles')
    } catch {
      setSubmitting(false)
    }
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
            disabled={challenge.battle_completed_by_participant}
            onClick={() => handleChallengeClick(challenge)}
          />
        ))}
      </div>

    </div>
  )
}
