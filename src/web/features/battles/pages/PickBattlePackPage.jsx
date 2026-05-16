import { useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router'
import { useLang } from '../../../context/LangContext'
import { usePacksQuery } from '@shared/api/challenges'
import { useFriendsQuery } from '@shared/api/friends'
import Button from '../../../components/Button'
import '../../challenges/pages/ChallengesPage.scss'
import '../../packs/pages/PackChallengesPage.scss'
import './PickBattlePage.scss'

const PackArt = () => (
  <div className="challenges__pack-art" aria-hidden="true">
    <svg viewBox="0 0 48 64" shapeRendering="crispEdges" className="challenges__pack-wrapper">
      <path className="challenges__pack-shadow" d="M8 8h34v48H8zM10 6h30v2H10zM10 56h30v2H10z" />
      <path className="challenges__pack-face" d="M6 10h36v44H6zM8 8h32v2H8zM8 54h32v2H8z" />
      <path className="challenges__pack-highlight" d="M8 10h6v42H8zM14 8h10v2H14z" />
      <path className="challenges__pack-dark" d="M36 10h6v44h-6zM28 54h12v2H28z" />
      <path className="challenges__pack-crimp" d="M8 8h4v2H8zM16 8h4v2h-4zM24 8h4v2h-4zM32 8h4v2h-4zM8 54h4v2H8zM16 54h4v2h-4zM24 54h4v2h-4zM32 54h4v2h-4z" />
      <path className="challenges__pack-stripe" d="M6 26h36v12H6z" />
      <path className="challenges__pack-stripe-highlight" d="M8 26h6v12H8z" />
      <path className="challenges__pack-stripe-dark" d="M36 26h6v12h-6z" />
      <path className="challenges__pack-spark" d="M22 16h4v4h-4zM20 20h8v4h-8zM22 24h4v4h-4zM14 42h4v4h-4zM30 42h4v4h-4z" />
    </svg>
  </div>
)

export default function PickBattlePackPage() {
  const { friendshipId } = useParams()
  const navigate         = useNavigate()
  const location         = useLocation()
  const { t }            = useLang()

  const stateFriend = location.state?.friend ?? null
  const { data: friendsList = [] } = useFriendsQuery({ enabled: !stateFriend })
  const friend = stateFriend
    ?? friendsList.find(f => f.id === friendshipId)?.friend
    ?? null

  const { data: allPacks = [] } = usePacksQuery()
  const packs = useMemo(
    () => allPacks.filter(p => (p.total_count ?? 0) > 0 && p.is_battle === true && !p.is_locked),
    [allPacks]
  )

  const friendName = friend?.name ?? ''

  return (
    <div className="pack-challenges pick-battle">

      <div className="pack-challenges__header">
        <Button color="muted" icon={null} onClick={() => navigate('/battles/friends')}>&lt; {t('battles.back')}</Button>
        <div className="pack-challenges__heading">
          <h2 className="pack-challenges__title">{t('battles.pickPackTitle')}</h2>
          <p className="pack-challenges__description">{t('battles.pickPackDescription')}</p>
        </div>
      </div>

      <p className="pick-battle__against">
        {t('battles.pickingAgainst')} "{friendName}"
      </p>

      <div className="challenges">
        <div className="challenges__packs">
          {packs.map((pack, i) => (
            <div
              key={pack.id}
              className="challenges__pack-card challenges__card-enter"
              style={{ '--card-enter-delay': `${Math.min(i, 7) * 35}ms` }}
              onClick={() => navigate(
                `/battles/new/${friendshipId}/packs/${pack.id}`,
                { state: { friend, pack } },
              )}
            >
              <PackArt />
              <div className="challenges__pack-copy">
                <span className="challenges__pack-name">{pack.name}</span>
                {pack.description && (
                  <span className="challenges__pack-description">{pack.description}</span>
                )}
              </div>
              <span className="challenges__pack-count">{pack.total_count ?? 0}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
