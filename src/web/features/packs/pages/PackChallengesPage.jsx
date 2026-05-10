import { useParams, useNavigate } from 'react-router'
import Button from '../../../components/Button'
import './PackChallengesPage.scss'

const PACK_DATA = {
  1: { name: 'Animals',  challenges: ['Elephant', 'Penguin', 'Chameleon', 'Platypus', 'Axolotl', 'Mantis Shrimp'] },
  2: { name: 'Vehicles', challenges: ['Hovercraft', 'Zeppelin', 'Snowcat', 'Rickshaw', 'Hydrofoil', 'Tuk-tuk'] },
  3: { name: 'Food',     challenges: ['Croissant', 'Dumpling', 'Pretzel', 'Baklava', 'Churro', 'Brigadeiro'] },
  4: { name: 'Sports',   challenges: ['Curling', 'Sepak Takraw', 'Kabaddi', 'Pelota', 'Bandy', 'Tchoukball'] },
  5: { name: 'Nature',   challenges: ['Stalactite', 'Fjord', 'Sinkhole', 'Atoll', 'Geiser', 'Permafrost'] },
  6: { name: 'Tech',     challenges: ['Floppy Disk', 'Dot Matrix', 'Punch Card', 'Teletext', 'Trackball', 'CRT Monitor'] },
  7: { name: 'Cities',   challenges: ['Reykjavik', 'Ulaanbaatar', 'Kathmandu', 'Ouagadougou', 'Antananarivo', 'Tegucigalpa'] },
  8: { name: 'Anatomy',  challenges: ['Patella', 'Clavicle', 'Cochlea', 'Uvula', 'Tibia', 'Sternum'] },
}

export default function PackChallengesPage() {
  const { packId } = useParams()
  const navigate = useNavigate()
  const pack = PACK_DATA[packId]

  if (!pack) return <p className="pack-challenges__not-found">Pack not found.</p>

  return (
    <div className="pack-challenges">

      <div className="pack-challenges__header">
        <Button color="muted" onClick={() => navigate('/challenges')}>&lt; Back</Button>
        <h2 className="pack-challenges__title">{pack.name}</h2>
      </div>

      <div className="pack-challenges__grid">
        {pack.challenges.map((name, i) => (
          <div
            key={i}
            className="pack-challenges__card"
            onClick={() => navigate(`/challenges/${packId}-${i + 1}/games/1`)}
          >
            <span className="pack-challenges__card-number">#{i + 1}</span>
            <span className="pack-challenges__card-name">{name}</span>
          </div>
        ))}
      </div>

    </div>
  )
}
