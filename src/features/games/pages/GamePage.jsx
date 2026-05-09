import { useParams } from 'react-router'

export default function GamePage() {
  const { challengeId, gameId } = useParams()
  return <div>Game {gameId} — Challenge {challengeId}</div>
}
