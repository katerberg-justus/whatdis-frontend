import { useNavigate } from 'react-router'
import { useAuth } from '../../../context/AuthContext'
import Button from '../../../components/Button'
import LockedOverlay from '../../../components/LockedOverlay'
import './ChallengesPage.scss'

const DAILY = [
  { id: 'person', label: 'Daily Person' },
  { id: 'object', label: 'Daily Object' },
]

const DIFFICULTIES = [
  { id: 'easy',   label: 'Easy',   color: 'green' },
  { id: 'medium', label: 'Medium', color: 'blue' },
  { id: 'hard',   label: 'Hard',   color: 'pink' },
]

const PACKS = [
  { id: 1, name: 'Animals',   total: 20, completed: 12 },
  { id: 2, name: 'Vehicles',  total: 15, completed:  0 },
  { id: 3, name: 'Food',      total: 18, completed: 18 },
  { id: 4, name: 'Sports',    total: 12, completed:  6 },
  { id: 5, name: 'Nature',    total: 25, completed:  3 },
  { id: 6, name: 'Tech',      total: 10, completed:  0 },
  { id: 7, name: 'Cities',    total: 16, completed:  8 },
  { id: 8, name: 'Anatomy',   total: 14, completed:  1 },
]

export default function ChallengesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="challenges">

      <section>
        <h2 className="challenges__section-title">Daily Challenge</h2>
        <div className="challenges__daily">
        {DAILY.map(({ id, label }) => (
          <div key={id} className="challenges__daily-card">
            <h3 className="challenges__daily-title">{label}</h3>
            <div className="challenges__difficulties">
              {DIFFICULTIES.map(({ id: diff, label: diffLabel, color }) => (
                <Button
                  key={diff}
                  color={color}
                  onClick={() => navigate(`/challenges/daily-${id}/games/${diff}`)}
                >
                  {diffLabel}
                </Button>
              ))}
            </div>
          </div>
        ))}
        </div>
      </section>

      <section>
        <h2 className="challenges__section-title">Challenge Packs</h2>
        <div className="locked-wrap">
          <div className={user ? undefined : 'locked-wrap__content'}>
            <div className="challenges__packs">
              {PACKS.map(({ id, name, total, completed }) => {
                const pct = Math.round((completed / total) * 100)
                return (
                  <div
                    key={id}
                    className="challenges__pack-card"
                    onClick={() => navigate(`/packs/${id}/challenges`)}
                  >
                    <span className="challenges__pack-name">{name}</span>
                    <span className="challenges__pack-count">{completed}/{total}</span>
                    <div className="challenges__progress">
                      <div className="challenges__progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          {!user && (
            <LockedOverlay
              title="Unlock Challenge Packs"
              message="Create an account to access curated challenge packs."
            />
          )}
        </div>
      </section>

    </div>
  )
}
