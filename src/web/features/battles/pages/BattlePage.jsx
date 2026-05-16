import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useAuth } from '../../../context/AuthContext'
import { useLang } from '../../../context/LangContext'
import { useNotifications } from '../../../context/NotificationContext'
import { apiGetBattle, apiSubmitBattleGuess } from '@shared/api/battles'
import ChatWindow from '../../../components/ChatWindow'
import Button from '../../../components/Button'
import Input from '../../../components/Input'
import Dialog from '../../../components/Dialog'
import IconButton from '../../../components/IconButton'
import { BackIcon } from '../../../components/icons'
import Sticker, { stickerFrameTier } from '../../../components/Sticker'
import '../../collectibles/pages/CollectiblesPage.scss'
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

function resolvePlayer(battle, userId) {
  const candidates = [battle.player1, battle.player2].filter(Boolean)
  const me  = candidates.find(p => p.id === userId)
  const opp = candidates.find(p => p.id !== userId)
  return { me, opp }
}

function oppDisplayName(opp) {
  return opp?.name ?? opp?.username ?? '?'
}

function responseKey(guess) {
  return guess.response ?? RESPONSE_CODE_KEY[guess.response_code] ?? 'indecisive'
}

export default function BattlePage() {
  const { battleId }  = useParams()
  const { user }      = useAuth()
  const { t }         = useLang()
  const { notify }    = useNotifications()
  const navigate      = useNavigate()

  const [battle,   setBattle]   = useState(null)
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)
  const [pendingMessage, setPendingMessage] = useState(null)
  const [resultDismissed, setResultDismissed] = useState(false)
  const pollRef = useRef(null)
  const inputRef = useRef(null)
  const pendingTimerRef = useRef(null)

  const loadBattle = useCallback(async () => {
    try {
      const data = await apiGetBattle(battleId)
      setBattle(data)
      return data
    } catch {
      return undefined
    }
  }, [battleId])

  useEffect(() => {
    window.clearTimeout(pendingTimerRef.current)
    const loadTimer = window.setTimeout(loadBattle, 0)
    return () => {
      window.clearTimeout(loadTimer)
      window.clearTimeout(pendingTimerRef.current)
    }
  }, [loadBattle])

  useEffect(() => {
    if (!battle || battle.status !== 'active') return
    const isMyTurn = battle.current_turn_id === user?.id
    if (isMyTurn) return

    const start = () => {
      clearInterval(pollRef.current)
      pollRef.current = setInterval(loadBattle, 15000)
    }
    const stop = () => clearInterval(pollRef.current)

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadBattle()
        start()
      } else {
        stop()
      }
    }

    if (document.visibilityState === 'visible') start()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [battle?.status, battle?.current_turn_id, user?.id, loadBattle])

  if (!battle) return <div className="battle" />

  const { opp } = resolvePlayer(battle, user?.id)
  const opponentName = oppDisplayName(opp)
  const isMyTurn   = battle.current_turn_id === user?.id
  const isFinished = battle.status === 'finished'
  const isPending  = battle.status === 'pending'
  const iWon       = isFinished && battle.winner_id === user?.id

  const activePendingMessage = pendingMessage?.battleId === battleId ? pendingMessage : null
  const messages = (battle.guesses ?? [])
    .filter(g => g.id !== activePendingMessage?.id)
    .map(g => {
    const guessPlayerId = g.user_id ?? g.player_id ?? g.player?.id
    const mine = guessPlayerId === user?.id
    return {
      question: g.content,
      answer:   responseKey(g),
      author:   mine ? t('battles.you') : opponentName,
      isMe:     mine,
    }
  })

  if (activePendingMessage) {
    messages.push(activePendingMessage)
  }

  async function handleSubmit() {
    if (!input.trim() || loading) return
    const question = input.trim()
    setLoading(true)
    setError(null)
    setInput('')
    setPendingMessage({
      battleId,
      question,
      answer: '...',
      finalAnswer: null,
      author: t('battles.you'),
      isMe: true,
    })
    try {
      const guess = await apiSubmitBattleGuess(battleId, question)
      setPendingMessage(current => current && ({
        ...current,
        id: guess.id,
        question: guess.content,
        finalAnswer: responseKey(guess),
      }))
      for (const a of guess.new_achievements ?? []) {
        notify({
          key: `achievement-${a.id}`,
          title: t('notifications.achievementUnlocked'),
          message: a.icon ? `${a.icon} ${a.name}` : a.name,
          link: '/achievements',
        })
      }
      await loadBattle()
      window.clearTimeout(pendingTimerRef.current)
      pendingTimerRef.current = window.setTimeout(() => {
        setPendingMessage(null)
      }, 420)
    } catch (err) {
      window.clearTimeout(pendingTimerRef.current)
      setPendingMessage(null)
      setInput(question)
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
        <IconButton
          className="battle__back"
          icon={<BackIcon />}
          onClick={() => navigate('/battles')}
          aria-label="Back"
        />
        <span className="battle__vs">
          <span className="battle__vs-name">{t('battles.you')}</span>
          <span className="battle__vs-sep">vs</span>
          <span className="battle__vs-name">{opponentName}</span>
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
        className="battle__chat"
        messages={messages}
        emptyLabel={isMyTurn ? t('battles.askFirst') : t('battles.waiting')}
        inputRef={inputRef}
      />

      {!isFinished && !isPending && (
        <>
          <div className="battle__controls">
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
              onClick={() => handleSubmit()}
              disabled={!canSubmit}
            >
              {t('game.ask')}
            </Button>
          </div>

          {error && <p className="battle__error">{error}</p>}
        </>
      )}

      {isFinished && !resultDismissed && (
        <Dialog
          title={iWon ? t('battles.youWon') : t('battles.youLost')}
          onClose={() => setResultDismissed(true)}
        >
          <Sticker
            className="battle__sticker-pop"
            sticker={battle.challenge?.sticker}
            name={battle.challenge?.subject}
            tier={iWon ? stickerFrameTier(messages.length) : 'silver'}
          />
          {iWon ? (
            <>
              <p className="battle__won-stat">
                {t('game.solvedIn')} <span className="battle__won-stat-count">{messages.length}</span> {messages.length === 1 ? t('game.guess') : t('game.guesses')}!
              </p>
            </>
          ) : (
            <p className="battle__result-label battle__result-label--loss">
              {t('battles.helpedSolve')}
            </p>
          )}
          <div className="battle__result-actions">
            <Button fullWidth color="muted" onClick={() => navigate('/battles')}>
              {t('battles.back')}
            </Button>
          </div>
        </Dialog>
      )}

    </div>
  )
}
