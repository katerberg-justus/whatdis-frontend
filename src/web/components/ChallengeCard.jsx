import './ChallengeCard.scss'
import { getStickerUrl } from '../assets/stickers'

const DIFF_MOD   = { easy: 'green', medium: 'blue', hard: 'pink' }
const DIFF_LABEL = { easy: 'Easy',  medium: 'Medium', hard: 'Hard' }

// 9x12 logical-pixel grid; blocky rects keep the mark deliberately pixelated.
function QuestionMarkSvg() {
  return (
    <svg
      viewBox="0 0 9 12"
      width="64" height="64"
      fill="currentColor"
      shapeRendering="crispEdges"
      className="challenge-card__silhouette"
    >
      <rect x="2" y="0" width="5" height="2" />
      <rect x="1" y="1" width="2" height="3" />
      <rect x="6" y="1" width="2" height="4" />
      <rect x="5" y="4" width="2" height="2" />
      <rect x="4" y="5" width="2" height="2" />
      <rect x="3" y="7" width="3" height="1" />
      <rect x="3" y="10" width="3" height="2" />
    </svg>
  )
}

const LockSvg = () => (
  <svg viewBox="0 0 10 12" width="10" height="12" fill="currentColor" shapeRendering="crispEdges">
    <rect x="2" y="0" width="6" height="2" />
    <rect x="2" y="2" width="2" height="3" />
    <rect x="6" y="2" width="2" height="3" />
    <rect x="0" y="5" width="10" height="7" />
  </svg>
)

const CheckSvg = () => (
  <svg viewBox="0 0 14 12" width="14" height="12" fill="currentColor" shapeRendering="crispEdges">
    <rect x="0" y="4" width="4" height="4" />
    <rect x="2" y="6" width="4" height="4" />
    <rect x="4" y="8" width="4" height="4" />
    <rect x="6" y="6" width="4" height="4" />
    <rect x="8" y="4" width="4" height="4" />
    <rect x="10" y="2" width="4" height="4" />
    <rect x="10" y="0" width="4" height="4" />
  </svg>
)

export default function ChallengeCard({ difficulty, label, subject, sticker, icon, onClick, locked, completed, freeBadge, className, style }) {
  const mod = DIFF_MOD[difficulty] ?? 'blue'
  const showSubject = completed && subject
  const stickerUrl = getStickerUrl(sticker ?? icon)

  return (
    <div
      className={['challenge-card', locked && 'challenge-card--locked', completed && 'challenge-card--completed', className].filter(Boolean).join(' ')}
      style={style}
      onClick={locked ? undefined : onClick}
    >
      <div className="challenge-card__badges">
        <span className={`challenge-card__badge challenge-card__badge--${mod}`}>
          {DIFF_LABEL[difficulty] ?? difficulty}
        </span>
        {freeBadge && !completed && <span className="challenge-card__free">{freeBadge}</span>}
      </div>
      {completed ? <span className="challenge-card__check"><CheckSvg /></span> : locked && <span className="challenge-card__lock"><LockSvg /></span>}
      <div className="challenge-card__art">
        {completed && stickerUrl ? (
          <img className="challenge-card__sticker" src={stickerUrl} alt="" aria-hidden="true" />
        ) : completed && icon ? (
          <span className="challenge-card__icon">{icon}</span>
        ) : (
          <QuestionMarkSvg />
        )}
      </div>
      {label && (
        <span className="challenge-card__label">
          {showSubject && <span className="challenge-card__subject">{subject}</span>}
          <span className={showSubject ? 'challenge-card__position' : undefined}>{label}</span>
        </span>
      )}
    </div>
  )
}
