import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useLang } from '../../../context/LangContext'
import { apiGetFriends, apiRemoveFriend } from '@shared/api/friends'
import Button from '../../../components/Button'
import './BattlesPage.scss'

export default function FriendPage() {
  const { friendshipId } = useParams()
  const navigate         = useNavigate()
  const { t }            = useLang()
  const [friend, setFriend] = useState(null)

  useEffect(() => {
    apiGetFriends()
      .then(data => {
        const match = data.find(f => f.id === friendshipId)
        if (match) setFriend(match)
      })
      .catch(() => {})
  }, [friendshipId])

  async function handleRemove() {
    try { await apiRemoveFriend(friendshipId); navigate('/battles/friends') } catch {}
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
