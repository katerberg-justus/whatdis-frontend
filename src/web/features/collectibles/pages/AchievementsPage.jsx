import { useAuth } from '../../../context/AuthContext'
import { useLang } from '../../../context/LangContext'
import { useAchievementsQuery, useMyAchievementsQuery } from '@shared/api/collectibles'
import './CollectiblesPage.scss'

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

const CATEGORY_ORDER = ['daily', 'guesses', 'streak', 'wins', 'battle_played', 'battle_won']

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

export default function AchievementsPage() {
  const { user }  = useAuth()
  const { t }     = useLang()
  const isGuest   = !user || user.is_guest

  const { data: all = [] }    = useAchievementsQuery()
  const { data: earned = [] } = useMyAchievementsQuery({ enabled: !isGuest })

  const visibleEarned = isGuest ? [] : earned
  const earnedMap = Object.fromEntries(visibleEarned.map(e => [e.achievement_id ?? e.id, e]))

  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    const items = all.filter(a => a.category === cat)
    if (items.length) acc.push({ cat, items })
    return acc
  }, [])

  return (
    <div className="collectibles__sections">
      {grouped.map(({ cat, items }) => {
        const nextId = items.find(a => !earnedMap[a.id])?.id
        return (
        <section key={cat} className="collectibles__section">
          <h2 className="collectibles__section-title">{t(`collectibles.cat.${cat}`)}</h2>
          <div className="collectibles__grid">
            {items.map((achievement, i) => {
              const userAchievement = earnedMap[achievement.id]
              const isEarned = Boolean(userAchievement)
              const isNext   = !isEarned && achievement.id === nextId
              const isHidden = !isEarned && !isNext

              return (
                <div
                  key={achievement.id}
                  className={[
                    'collectibles__card',
                    'collectibles__card-enter',
                    isEarned && 'collectibles__card--earned',
                    isHidden && 'collectibles__card--locked',
                  ].filter(Boolean).join(' ')}
                  style={{ '--card-enter-delay': `${Math.min(i, 7) * 35}ms` }}
                >
                  {isEarned && <span className="collectibles__card-check"><CheckSvg /></span>}
                  <span className="collectibles__card-icon">{isHidden ? '?' : achievement.icon}</span>
                  <span className={`collectibles__card-name${isHidden ? ' collectibles__card-name--blur' : ''}`}>
                    {isHidden ? 'Hidden Achievement' : achievement.name}
                  </span>
                  <span className={`collectibles__card-desc${isHidden ? ' collectibles__card-desc--blur' : ''}`}>
                    {isHidden ? 'Keep playing to unlock this secret achievement.' : achievement.description}
                  </span>
                  {isEarned ? (
                    <span className="collectibles__card-date">{formatDate(userAchievement.earned_at)}</span>
                  ) : (
                    <span className="collectibles__card-locked">{t('collectibles.locked')}</span>
                  )}
                </div>
              )
            })}
          </div>
        </section>
        )
      })}
    </div>
  )
}
