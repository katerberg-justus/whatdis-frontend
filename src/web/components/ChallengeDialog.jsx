import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useLang } from '../context/LangContext'
import { apiGetPacks } from '@shared/api/challenges'
import { apiCreateBattle } from '@shared/api/battles'
import Dialog from './Dialog'
import Button from './Button'
import './ChallengeDialog.scss'

const DIFFICULTIES = ['easy', 'medium', 'hard']

export default function ChallengeDialog({ friend, friendshipId, onClose }) {
  const { t }      = useLang()
  const navigate   = useNavigate()
  const [packs,       setPacks]       = useState([])
  const [selectedPack, setSelectedPack] = useState(null)
  const [difficulty,  setDifficulty]  = useState('medium')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')

  useEffect(() => {
    apiGetPacks()
      .then(data => {
        const playable = data.filter(p => !p.is_daily && !/daily/i.test(p.name) && !p.is_locked)
        setPacks(playable)
        if (playable.length > 0) setSelectedPack(playable[0].id)
      })
      .catch(() => {})
  }, [])

  async function handleSubmit() {
    if (!selectedPack) return
    setLoading(true)
    setError('')
    try {
      const battle = await apiCreateBattle({
        challenged_id: friend.id,
        pack_id:       selectedPack,
        difficulty,
      })
      navigate(`/battles/${battle.id}`)
    } catch {
      setError(t('battles.submitError'))
      setLoading(false)
    }
  }

  return (
    <Dialog title={friend.name} onClose={onClose}>
      <div className="challenge">
        <p className="challenge__label">{t('battles.selectPack')}</p>
        <div className="challenge__packs">
          {packs.map(p => (
            <button
              key={p.id}
              type="button"
              className={['challenge__option', selectedPack === p.id && 'challenge__option--active'].filter(Boolean).join(' ')}
              onClick={() => setSelectedPack(p.id)}
            >
              {p.name}
            </button>
          ))}
        </div>

        <p className="challenge__label">{t('battles.difficulty')}</p>
        <div className="challenge__difficulties">
          {DIFFICULTIES.map(d => (
            <button
              key={d}
              type="button"
              className={['challenge__option', `challenge__option--${d}`, difficulty === d && 'challenge__option--active'].filter(Boolean).join(' ')}
              onClick={() => setDifficulty(d)}
            >
              {t(`game.diff${d.charAt(0).toUpperCase() + d.slice(1)}`)}
            </button>
          ))}
        </div>

        {error && <p className="challenge__error">{error}</p>}

        <Button fullWidth disabled={loading || !selectedPack} onClick={handleSubmit}>
          {t('battles.challenge')}
        </Button>
      </div>
    </Dialog>
  )
}
