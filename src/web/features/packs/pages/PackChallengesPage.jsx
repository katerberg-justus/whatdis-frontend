import { useParams, useNavigate } from 'react-router'
import { usePackQuery, usePackChallengesQuery } from '@shared/api/challenges'
import { useCreateGameMutation } from '@shared/api/games'
import IconButton from '../../../components/IconButton'
import { BackIcon } from '../../../components/icons'
import ChallengeCard from '../../../components/ChallengeCard'
import './PackChallengesPage.scss'

export default function PackChallengesPage() {
  const { packId } = useParams()
  const navigate = useNavigate()

  const { data: pack, error: packError } = usePackQuery(packId)
  const { data: challenges = [], error: challengesError } = usePackChallengesQuery(packId)
  const createGameMutation = useCreateGameMutation()

  const error = Boolean(packError || challengesError)

  async function handleChallengeClick(challenge, position) {
    try {
      const game = await createGameMutation.mutateAsync({ challenge_id: challenge.id })
      navigate(`/games/${game.id}`, {
        state: {
          label:      pack?.name ?? '',
          packId,
          position,
          difficulty: challenge.difficulty,
        },
      })
    } catch { /* swallow */ }
  }

  if (error) return <p className="pack-challenges__not-found">Pack not found.</p>

  return (
    <div className="pack-challenges">

      <div className="pack-challenges__header">
        <IconButton icon={<BackIcon />} onClick={() => navigate('/challenges')} aria-label="Back" />
        <div className="pack-challenges__heading">
          <h2 className="pack-challenges__title">{pack?.name ?? ''}</h2>
          {pack?.description && <p className="pack-challenges__description">{pack.description}</p>}
        </div>
      </div>

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
            onClick={() => handleChallengeClick(challenge, i + 1)}
          />
        ))}
      </div>

    </div>
  )
}
