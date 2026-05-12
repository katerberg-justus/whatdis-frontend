import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useLang } from '../../../context/LangContext'
import { apiGetAchievements, apiGetMyAchievements } from '@shared/api/collectibles'
import './CollectiblesPage.scss'

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

const CATEGORY_ORDER = ['daily', 'questions', 'streak', 'wins']

export default function AchievementsPage() {
  const { user }             = useAuth()
  const { t }                = useLang()
  const [all,    setAll]     = useState([])
  const [earned, setEarned]  = useState([])

  useEffect(() => {
    apiGetAchievements().then(setAll).catch(() => {})
    if (user) apiGetMyAchievements().then(setEarned).catch(() => {})
  }, [user])

  const earnedMap = Object.fromEntries(earned.map(e => [e.achievement_id ?? e.id, e]))

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
            {items.map((achievement) => {
              const userAchievement = earnedMap[achievement.id]
              const isEarned = Boolean(userAchievement)
              const isNext   = !isEarned && achievement.id === nextId
              const isHidden = !isEarned && !isNext

              return (
                <div
                  key={achievement.id}
                  className={['collectibles__card', isHidden && 'collectibles__card--locked'].filter(Boolean).join(' ')}
                >
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
