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

  // Uncategorised fallback
  const known = new Set(CATEGORY_ORDER)
  const rest = all.filter(a => !known.has(a.category))
  if (rest.length) grouped.push({ cat: 'other', items: rest })

  return (
    <div className="collectibles__sections">
      {grouped.map(({ cat, items }) => (
        <section key={cat} className="collectibles__section">
          <h2 className="collectibles__section-title">{t(`collectibles.cat.${cat}`)}</h2>
          <div className="collectibles__grid">
            {items.map((achievement) => {
              const userAchievement = earnedMap[achievement.id]
              const isEarned = Boolean(userAchievement)

              return (
                <div
                  key={achievement.id}
                  className={['collectibles__card', !isEarned && 'collectibles__card--locked'].filter(Boolean).join(' ')}
                >
                  <span className="collectibles__card-icon">{isEarned ? achievement.icon : '?'}</span>
                  <span className={`collectibles__card-name${!isEarned ? ' collectibles__card-name--blur' : ''}`}>
                    {isEarned ? achievement.name : 'Hidden Achievement'}
                  </span>
                  <span className={`collectibles__card-desc${!isEarned ? ' collectibles__card-desc--blur' : ''}`}>
                    {isEarned ? achievement.description : 'Keep playing to unlock this secret achievement.'}
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
      ))}
    </div>
  )
}
