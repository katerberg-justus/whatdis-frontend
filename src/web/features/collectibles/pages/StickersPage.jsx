import { useMemo } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useLang } from '../../../context/LangContext'
import { useGamesQuery } from '@shared/api/games'
import { useBattlesQuery } from '@shared/api/battles'
import { useDailyChallengesQuery, usePacksQuery } from '@shared/api/challenges'
import Sticker, { stickerFrameTier } from '../../../components/Sticker'
import './CollectiblesPage.scss'

const FALLBACK_PACK = { id: 'unknown', name: 'Challenge Pack' }

function packFromGame(game) {
  return {
    id: game.pack_id ?? game.challenge?.pack_id ?? FALLBACK_PACK.id,
    name: game.pack_name ?? game.challenge?.pack_name ?? FALLBACK_PACK.name,
  }
}

function packFromBattle(battle) {
  const pack = battle.challenge_pack ?? battle.pack
  return {
    id: pack?.id ?? battle.pack_id ?? battle.challenge?.pack_id ?? FALLBACK_PACK.id,
    name: pack?.name ?? battle.pack_name ?? battle.challenge?.pack_name ?? FALLBACK_PACK.name,
  }
}

export default function StickersPage() {
  const { user } = useAuth()
  const { t } = useLang()

  const { data: games = [] }   = useGamesQuery()
  const { data: battles = [] } = useBattlesQuery()
  const { data: packs = [] }   = usePacksQuery()
  const { data: dailies = [] } = useDailyChallengesQuery()

  const stickerGroups = useMemo(() => {
    const completedGameChallengeIds = new Set()

    const completedGames = games
      .filter(game => game.completed_at && game.challenge?.sticker)
      .map(game => {
        if (game.challenge_id) completedGameChallengeIds.add(game.challenge_id)
        return {
          id: `game-${game.id}`,
          completedAt: game.completed_at,
          challenge: game.challenge,
          pack: packFromGame(game),
          tier: stickerFrameTier(game.guess_count ?? 0),
          guessCount: game.guess_count ?? 0,
        }
      })

    const completedBattles = battles
      .filter(battle => battle.status === 'finished' && battle.challenge?.sticker)
      .map(battle => ({
        id: `battle-${battle.id}`,
        completedAt: battle.completed_at ?? battle.updated_at,
        challenge: battle.challenge,
        pack: packFromBattle(battle),
        tier: battle.winner_id === user?.id ? stickerFrameTier(battle.guess_count ?? 0) : 'silver',
        guessCount: battle.guess_count ?? 0,
      }))

    const completedDailies = dailies
      .filter(daily => daily.completed && daily.sticker && !completedGameChallengeIds.has(daily.challenge_id))
      .map(daily => {
        const pack = packs.find(p => p.id === daily.pack_id) ?? {
          id: 'daily',
          name: t('challenges.dailySection'),
        }
        return {
          id: `daily-${daily.id ?? daily.challenge_id}`,
          completedAt: daily.available_on,
          challenge: {
            id: daily.challenge_id,
            subject: daily.subject,
            sticker: daily.sticker,
          },
          pack,
          tier: 'bronze',
          guessCount: null,
        }
      })

    const packOrder = new Map(packs.map((pack, index) => [pack.id, index]))
    const groupsByPack = new Map()

    for (const item of [...completedGames, ...completedBattles, ...completedDailies]) {
      const pack = item.pack ?? FALLBACK_PACK
      const key = pack.id ?? pack.name ?? FALLBACK_PACK.id
      const group = groupsByPack.get(key) ?? {
        key,
        pack: {
          id: pack.id ?? key,
          name: pack.name ?? FALLBACK_PACK.name,
        },
        items: [],
        latestCompletedAt: item.completedAt,
      }

      group.items.push(item)
      if (new Date(item.completedAt) > new Date(group.latestCompletedAt)) {
        group.latestCompletedAt = item.completedAt
      }
      groupsByPack.set(key, group)
    }

    return Array.from(groupsByPack.values())
      .map(group => ({
        ...group,
        items: group.items.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)),
      }))
      .sort((a, b) => {
        const orderA = packOrder.get(a.pack.id) ?? Number.MAX_SAFE_INTEGER
        const orderB = packOrder.get(b.pack.id) ?? Number.MAX_SAFE_INTEGER
        if (orderA !== orderB) return orderA - orderB
        return new Date(b.latestCompletedAt) - new Date(a.latestCompletedAt)
      })
  }, [games, battles, dailies, packs, user?.id, t])

  if (!stickerGroups.length) {
    return (
      <div className="collectibles__empty">
        {t('collectibles.noStickers')}
      </div>
    )
  }

  let stickerIndex = 0

  return (
    <div className="collectibles__sections">
      {stickerGroups.map(group => (
        <section key={group.key} className="collectibles__section">
          <h2 className="collectibles__section-title">{group.pack.name}</h2>
          <div className="collectibles__sticker-grid">
            {group.items.map(item => {
              const challenge = item.challenge
              const enterDelay = Math.min(stickerIndex++, 12) * 24

              return (
                <Sticker
                  key={item.id}
                  as="article"
                  sticker={challenge.sticker}
                  name={challenge.subject}
                  tier={item.tier}
                  title={item.guessCount == null ? challenge.subject : `${challenge.subject} (${item.guessCount})`}
                  className="collectibles__card-enter"
                  style={{ '--card-enter-delay': `${enterDelay}ms` }}
                />
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
