import { useEffect, useState } from 'react'
import { useLang } from '../../../context/LangContext'
import { apiGetGames } from '@shared/api/games'
import Sticker, { stickerFrameTier } from '../../../components/Sticker'
import './CollectiblesPage.scss'

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
          <Sticker
            key={game.id}
            as="article"
            sticker={challenge.sticker}
            icon={challenge.icon}
            name={challenge.subject}
            tier={stickerFrameTier(guessCount)}
            title={`${challenge.subject} (${guessCount})`}
          />
        )
      })}
    </div>
  )
}
