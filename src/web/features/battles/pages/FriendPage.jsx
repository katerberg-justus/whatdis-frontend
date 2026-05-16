import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useLang } from '../../../context/LangContext'
import { useFriendsQuery, useRemoveFriendMutation } from '@shared/api/friends'
import Button from '../../../components/Button'
import './BattlesPage.scss'

export default function FriendPage() {
  const { friendshipId } = useParams()
  const navigate         = useNavigate()
  const { t }            = useLang()

  const { data: friends = [] } = useFriendsQuery()
  const removeMutation = useRemoveFriendMutation()

  const friend = useMemo(() => friends.find(f => f.id === friendshipId), [friends, friendshipId])

  async function handleRemove() {
    try {
      await removeMutation.mutateAsync(friendshipId)
      navigate('/battles/friends')
    } catch { /* swallow */ }
  }

  if (!friend) return null

  return (
    <div className="battles">
      <section className="battles__section">
        <Button color="muted" icon={null} onClick={() => navigate('/battles/friends')}>&lt; {t('battles.back')}</Button>
      </section>

      <section className="battles__section">
        <h2 className="battles__section-title">{friend.friend.name}</h2>
        <p className="battles__empty">{friend.friend.email}</p>
      </section>

      <section className="battles__section">
        <div className="battles__actions">
          <Button color="pink" icon={null} onClick={() => navigate(`/battles/new/${friendshipId}`, { state: { friend: friend.friend } })}>{t('battles.challenge')}</Button>
          <Button color="muted" icon={null} onClick={handleRemove}>{t('friends.remove')}</Button>
        </div>
      </section>
    </div>
  )
}
