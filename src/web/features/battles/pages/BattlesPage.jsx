import Button from '../../../components/Button'
import './BattlesPage.scss'

const INVITES = [
  { id: 1, from: 'PixelKing',  pack: 'Animals', difficulty: 'hard' },
  { id: 2, from: 'RetroQueen', pack: 'Tech',     difficulty: 'medium' },
]

const ONGOING = [
  { id: 1, opponent: 'PixelKing',   pack: 'Kitchen Appliances', difficulty: 'easy',   yourTurn: true,  score: [2, 1] },
  { id: 2, opponent: 'RetroQueen',  pack: 'Animals',            difficulty: 'hard',   yourTurn: false, score: [0, 3] },
  { id: 3, opponent: 'GlitchWizard',pack: 'Cities',             difficulty: 'medium', yourTurn: true,  score: [1, 1] },
  { id: 4, opponent: 'NeonShadow',  pack: 'Sports',             difficulty: 'easy',   yourTurn: false, score: [3, 2] },
]

export default function BattlesPage() {
  return (
    <div className="battles">

      {INVITES.length > 0 && (
        <section>
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

      <section>
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

      <div className="battles__footer">
        <Button color="pink" fullWidth>Start New Battle</Button>
      </div>

    </div>
  )
}
