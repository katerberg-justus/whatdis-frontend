import { useEffect, useState } from 'react'
import { useLang } from '../../../context/LangContext'
import { apiGetGames } from '@shared/api/games'
import './CollectiblesPage.scss'

function frameTier(guessCount) {
  if (guessCount < 20) return 'gold'
  if (guessCount < 40) return 'silver'
  return 'bronze'
}

export default function StickersPage() {
  const { t } = useLang()
  const [stickers, setStickers] = useState([])

  useEffect(() => {
    apiGetGames()
      .then(games => {
        const completed = games
          .filter(game => game.completed_at && game.challenge)
          .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
        setStickers(completed)
      })
      .catch(() => setStickers([]))
  }, [])

  if (!stickers.length) {
    return (
      <div className="collectibles__empty">
        {t('collectibles.noStickers')}
      </div>
    )
  }

  return (
    <div className="collectibles__sticker-grid">
      {stickers.map((game) => {
        const challenge = game.challenge
        const guessCount = game.guess_count ?? 0

        return (
          <article
            key={game.id}
            className={`collectibles__sticker collectibles__sticker--${frameTier(guessCount)}`}
            title={`${challenge.subject} (${guessCount})`}
          >
            <span className="collectibles__sticker-icon" aria-hidden="true">
              {challenge.icon || '?'}
            </span>
            <span className="collectibles__sticker-name">{challenge.subject}</span>
          </article>
        )
      })}
    </div>
  )
}
