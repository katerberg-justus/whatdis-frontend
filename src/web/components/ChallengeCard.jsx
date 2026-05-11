import './ChallengeCard.scss'

const DIFF_MOD   = { easy: 'green', medium: 'blue', hard: 'pink' }
const DIFF_LABEL = { easy: 'Easy',  medium: 'Medium', hard: 'Hard' }

// 9×16 logical-pixel grid — low res is intentional; blockiness reads as blur
function PersonSvg() {
  return (
    <svg
      viewBox="0 0 9 16"
      width="64" height="64"
      fill="currentColor"
      shapeRendering="crispEdges"
      className="challenge-card__silhouette"
    >
      <rect x="3" y="0" width="3" height="1" />   {/* head top */}
      <rect x="2" y="1" width="5" height="2" />   {/* head */}
      <rect x="3" y="3" width="3" height="1" />   {/* head bottom */}
      <rect x="3" y="4" width="3" height="1" />   {/* neck */}
      <rect x="1" y="5" width="7" height="1" />   {/* shoulders */}
      <rect x="0" y="6" width="9" height="2" />   {/* arms + torso */}
      <rect x="2" y="8" width="5" height="2" />   {/* lower torso */}
      <rect x="2" y="10" width="2" height="6" />  {/* left leg */}
      <rect x="5" y="10" width="2" height="6" />  {/* right leg */}
    </svg>
  )
}

// 12×12 logical-pixel grid — trophy: wide cup narrows to stem, base widens
function ObjectSvg() {
  return (
    <svg
      viewBox="0 0 12 12"
      width="64" height="64"
      fill="currentColor"
      shapeRendering="crispEdges"
      className="challenge-card__silhouette"
    >
      <rect x="0" y="0" width="12" height="3" />  {/* cup top */}
      <rect x="1" y="3" width="10" height="1" />  {/* cup */}
      <rect x="2" y="4" width="8"  height="1" />
      <rect x="3" y="5" width="6"  height="1" />
      <rect x="4" y="6" width="4"  height="1" />  {/* cup bottom */}
      <rect x="5" y="7" width="2"  height="2" />  {/* stem */}
      <rect x="3" y="9" width="6"  height="1" />  {/* base */}
      <rect x="2" y="10" width="8" height="1" />
      <rect x="1" y="11" width="10" height="1" /> {/* base bottom */}
    </svg>
  )
}

const SILHOUETTES = { person: PersonSvg, object: ObjectSvg }

export default function ChallengeCard({ type, difficulty, label, onClick }) {
  const Silhouette = SILHOUETTES[type] ?? ObjectSvg
  const mod = DIFF_MOD[difficulty] ?? 'blue'

  return (
    <div className="challenge-card" onClick={onClick}>
      <span className={`challenge-card__badge challenge-card__badge--${mod}`}>
        {DIFF_LABEL[difficulty] ?? difficulty}
      </span>
      <div className="challenge-card__art">
        <Silhouette />
      </div>
      {label && <span className="challenge-card__label">{label}</span>}
    </div>
  )
}
