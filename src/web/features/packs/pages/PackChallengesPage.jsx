import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { apiGetPack, apiGetPackChallenges } from '@shared/api/challenges'
import { apiCreateGame } from '@shared/api/games'
import Button from '../../../components/Button'
import ChallengeCard from '../../../components/ChallengeCard'
import './PackChallengesPage.scss'

export default function PackChallengesPage() {
  const { packId } = useParams()
  const navigate = useNavigate()
  const [pack, setPack] = useState(null)
  const [challenges, setChallenges] = useState([])
  const [error, setError] = useState(false)

  useEffect(() => {
    Promise.all([apiGetPack(packId), apiGetPackChallenges(packId)])
      .then(([p, ch]) => { setPack(p); setChallenges(ch) })
      .catch(() => setError(true))
  }, [packId])

  async function handleChallengeClick(challenge, position) {
    try {
      const game = await apiCreateGame({ challenge_id: challenge.id })
      navigate(`/games/${game.id}`, {
        state: {
          label:      pack?.name ?? '',
          packId,
          position,
          difficulty: challenge.difficulty,
          guessLimit: challenge.guess_limit,
        },
      })
    } catch {}
  }

  if (error) return <p className="pack-challenges__not-found">Pack not found.</p>

  return (
    <div className="pack-challenges">

      <div className="pack-challenges__header">
        <Button color="muted" icon={null} onClick={() => navigate('/challenges')}>&lt; Back</Button>
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
