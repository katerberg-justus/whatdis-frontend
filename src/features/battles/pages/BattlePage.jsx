import { useParams } from 'react-router'

export default function BattlePage() {
  const { challengeId, battleId } = useParams()
  return <div>Battle {battleId} — Challenge {challengeId}</div>
}
