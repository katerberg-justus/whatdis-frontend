import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useAuth } from '../../../context/AuthContext'
import { useLang } from '../../../context/LangContext'
import { apiGetBattle, apiSubmitBattleGuess } from '@shared/api/battles'
import ChatWindow from '../../../components/ChatWindow'
import Button from '../../../components/Button'
import Input from '../../../components/Input'
import './BattlePage.scss'

const RESPONSE_CODE_KEY = {
  0: 'no',
  1: 'yes',
  2: 'indecisive',
  3: 'refusal',
  4: 'win',
  5: 'possible',
  6: 'possibly_not',
}

const RESPONSE_OPTIONS = [
  { code: 0, key: 'no'          },
  { code: 1, key: 'yes'         },
  { code: 2, key: 'indecisive'  },
  { code: 5, key: 'possible'    },
  { code: 6, key: 'possibly_not'},
  { code: 3, key: 'refusal'     },
]

function resolvePlayer(battle, userId) {
  const candidates = [
    battle.player1, battle.player2,
    battle.challenger, battle.challenged,
  ].filter(Boolean)
  const me  = candidates.find(p => p.id === userId)
  const opp = candidates.find(p => p.id !== userId)
  return { me, opp }
}

function oppDisplayName(opp) {
  return opp?.name ?? opp?.username ?? '?'
}

export default function BattlePage() {
  const { battleId }  = useParams()
  const { user }      = useAuth()
  const { t }         = useLang()
  const navigate      = useNavigate()

  const [battle,   setBattle]   = useState(null)
  const [input,    setInput]    = useState('')
  const [respCode, setRespCode] = useState(1)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)
  const pollRef = useRef(null)
  const inputRef = useRef(null)

  const loadBattle = useCallback(async () => {
    try {
      const data = await apiGetBattle(battleId)
      setBattle(data)
      return data
    } catch {}
  }, [battleId])

  useEffect(() => { loadBattle() }, [loadBattle])

  useEffect(() => {
    clearInterval(pollRef.current)
    if (!battle || battle.status !== 'active') return
    const isMyTurn = battle.current_turn_id === user?.id
    if (isMyTurn) return
    pollRef.current = setInterval(loadBattle, 5000)
    return () => clearInterval(pollRef.current)
  }, [battle?.status, battle?.current_turn_id, user?.id, loadBattle])

  if (!battle) return <div className="battle" />

  const { opp } = resolvePlayer(battle, user?.id)
  const opponentName = oppDisplayName(opp)
  const isMyTurn   = battle.current_turn_id === user?.id
  const isFinished = battle.status === 'finished'
  const isPending  = battle.status === 'pending'
  const iWon       = isFinished && battle.winner_id === user?.id

  const messages = (battle.guesses ?? []).map(g => {
    const guessPlayerId = g.player_id ?? g.player?.id
    const mine = guessPlayerId === user?.id
    return {
      question: g.content,
      answer:   RESPONSE_CODE_KEY[g.response_code] ?? 'indecisive',
      author:   mine ? t('battles.you') : opponentName,
      isMe:     mine,
    }
  })

  async function handleSubmit(code = respCode) {
    if (!input.trim() || loading) return
    setLoading(true)
    setError(null)
    try {
      await apiSubmitBattleGuess(battleId, input.trim(), code)
      setInput('')
      setRespCode(1)
      await loadBattle()
    } catch (err) {
      setError(
        err.response?.status === 429
          ? t('battles.outOfEnergy')
          : t('battles.submitError')
      )
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = isMyTurn && !!input.trim() && !loading

  return (
    <div className="battle">

      <div className="battle__meta">
        <button className="battle__back" onClick={() => navigate('/battles')}>
          ←
        </button>
        <span className="battle__vs">
          {t('battles.you')}
          <span className="battle__vs-sep"> vs </span>
          {opponentName}
        </span>
        <span className={[
          'battle__status',
          isFinished && `battle__status--${iWon ? 'won' : 'lost'}`,
          !isFinished && isMyTurn  && 'battle__status--yours',
          !isFinished && !isMyTurn && 'battle__status--theirs',
        ].filter(Boolean).join(' ')}>
          {isFinished
            ? (iWon ? t('battles.youWon') : t('battles.youLost'))
            : isPending
              ? t('battles.waiting')
              : isMyTurn ? t('battles.yourTurn') : t('battles.theirTurn')}
        </span>
      </div>

      <ChatWindow
        messages={messages}
        emptyLabel={isMyTurn ? t('battles.askFirst') : t('battles.waiting')}
        inputRef={inputRef}
      />

      {!isFinished && !isPending && (
        <div className="battle__controls">
          <div className="battle__responses">
            {RESPONSE_OPTIONS.map(({ code, key }) => (
              <button
                key={code}
                type="button"
                className={[
                  'battle__resp',
                  `battle__resp--${key}`,
                  respCode === code && 'battle__resp--active',
                ].filter(Boolean).join(' ')}
                onClick={() => setRespCode(code)}
              >
                {t(`game.response.${key}`)}
              </button>
            ))}
          </div>

          <div className="battle__input-row">
            <Input
              ref={inputRef}
              placeholder={isMyTurn ? t('game.inputPlaceholder') : t('battles.waiting')}
              value={input}
              onChange={e => setInput(e.target.value.slice(0, 50))}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              disabled={!isMyTurn || loading}
              maxLength={50}
            />
            <Button
              color="blue"
              onClick={() => handleSubmit(respCode)}
              disabled={!canSubmit}
            >
              {t('game.ask')}
            </Button>
            <Button
              color="green"
              onClick={() => handleSubmit(4)}
              disabled={!canSubmit}
              title={t('game.response.win')}
            >
              {t('game.response.win')}
            </Button>
          </div>

          {error && <p className="battle__error">{error}</p>}
        </div>
      )}

      {isFinished && (
        <div className="battle__result">
          <span className={`battle__result-label battle__result-label--${iWon ? 'win' : 'loss'}`}>
            {iWon ? t('battles.youWon') : t('battles.youLost')}
          </span>
          <Button fullWidth onClick={() => navigate('/battles')}>
            {t('battles.back')}
          </Button>
        </div>
      )}

    </div>
  )
}
