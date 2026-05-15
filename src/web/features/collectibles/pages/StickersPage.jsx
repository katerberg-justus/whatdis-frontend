import { useEffect, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useLang } from '../../../context/LangContext'
import { apiGetGames } from '@shared/api/games'
import { apiGetBattles } from '@shared/api/battles'
import Sticker, { stickerFrameTier } from '../../../components/Sticker'
import './CollectiblesPage.scss'

export default function StickersPage() {
  const { user } = useAuth()
  const { t } = useLang()
  const [stickers, setStickers] = useState([])

  useEffect(() => {
    Promise.allSettled([apiGetGames(), apiGetBattles()])
      .then(([gamesResult, battlesResult]) => {
        const games = gamesResult.status === 'fulfilled' ? gamesResult.value : []
        const battles = battlesResult.status === 'fulfilled' ? battlesResult.value : []

        const completedGames = games
          .filter(game => game.completed_at && game.challenge?.sticker)
          .map(game => ({
            id: `game-${game.id}`,
            completedAt: game.completed_at,
            challenge: game.challenge,
            tier: stickerFrameTier(game.guess_count ?? 0),
            guessCount: game.guess_count ?? 0,
          }))

        const completedBattles = battles
          .filter(battle => battle.status === 'finished' && battle.challenge?.sticker)
          .map(battle => ({
            id: `battle-${battle.id}`,
            completedAt: battle.completed_at ?? battle.updated_at,
            challenge: battle.challenge,
            tier: battle.winner_id === user?.id ? stickerFrameTier(battle.guess_count ?? 0) : 'silver',
            guessCount: battle.guess_count ?? 0,
          }))

        setStickers([...completedGames, ...completedBattles]
          .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)))
      })
      .catch(() => setStickers([]))
  }, [user?.id])

  if (!stickers.length) {
    return (
      <div className="collectibles__empty">
        {t('collectibles.noStickers')}
      </div>
    )
  }

  return (
    <div className="collectibles__sticker-grid">
      {stickers.map((item) => {
        const challenge = item.challenge

        return (
          <Sticker
            key={item.id}
            as="article"
            sticker={challenge.sticker}
            name={challenge.subject}
            tier={item.tier}
            title={`${challenge.subject} (${item.guessCount})`}
          />
        )
      })}
    </div>
  )
}
