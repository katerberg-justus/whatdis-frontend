import { useNavigate } from 'react-router'
import { useAuth } from '../../../context/AuthContext'
import Button from '../../../components/Button'
import LockedOverlay from '../../../components/LockedOverlay'
import './BattlesPage.scss'

const INVITES = [
  { id: 1, from: 'PixelKing',  pack: 'Animals', difficulty: 'hard' },
  { id: 2, from: 'RetroQueen', pack: 'Tech',     difficulty: 'medium' },
]

const ONGOING = [
  { id: 1, opponent: 'PixelKing',    pack: 'Kitchen Appliances', difficulty: 'easy',   yourTurn: true,  score: [2, 1] },
  { id: 2, opponent: 'RetroQueen',   pack: 'Animals',            difficulty: 'hard',   yourTurn: false, score: [0, 3] },
  { id: 3, opponent: 'GlitchWizard', pack: 'Cities',             difficulty: 'medium', yourTurn: true,  score: [1, 1] },
  { id: 4, opponent: 'NeonShadow',   pack: 'Sports',             difficulty: 'easy',   yourTurn: false, score: [3, 2] },
]

const IconLock = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
    <rect x="5" y="0" width="6" height="2" />
    <rect x="5" y="2" width="2" height="4" />
    <rect x="9" y="2" width="2" height="4" />
    <rect x="1" y="5" width="14" height="11" />
  </svg>
)

export default function BattlesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="battles">

      <div className="locked-wrap">
        <div className={user ? undefined : 'locked-wrap__content'}>

          {INVITES.length > 0 && (
            <section className="battles__section">
              <h2 className="battles__section-title">Pending Invites</h2>
              <ul className="battles__list">
                {INVITES.map(({ id, from, pack, difficulty }) => (
                  <li key={id} className="battles__invite">
                    <div className="battles__info">
                      <span className="battles__opponent">{from}</span>
                      <span className="battles__meta">
                        {pack}
                        <span className={`battles__diff battles__diff--${difficulty}`}>{difficulty}</span>
                      </span>
                    </div>
                    <div className="battles__actions">
                      <Button color="green">Accept</Button>
                      <Button color="muted">Decline</Button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="battles__section">
            <h2 className="battles__section-title">Ongoing</h2>
            <ul className="battles__list">
              {ONGOING.map(({ id, opponent, pack, difficulty, yourTurn, score }) => (
                <li key={id} className="battles__battle">
                  <div className="battles__info">
                    <span className="battles__opponent">{opponent}</span>
                    <span className="battles__meta">
                      {pack}
                      <span className={`battles__diff battles__diff--${difficulty}`}>{difficulty}</span>
                    </span>
                  </div>
                  <div className="battles__status">
                    <span className="battles__score">{score[0]} – {score[1]}</span>
                    <span className={`battles__turn battles__turn--${yourTurn ? 'yours' : 'theirs'}`}>
                      {yourTurn ? 'Your turn' : 'Their turn'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

        </div>

        {!user && (
          <LockedOverlay
            title="Challenge Friends"
            message="Sign in to battle real opponents in pixelated guessing duels."
          />
        )}
      </div>

      <div className="battles__footer">
        <Button
          color="pink"
          fullWidth
          onClick={() => user ? null : navigate('/register')}
        >
          {!user && <IconLock />}
          Start New Battle
        </Button>
      </div>

    </div>
  )
}
