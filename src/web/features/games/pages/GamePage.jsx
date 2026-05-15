import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router'
import { apiGetGame, apiGetGuesses, apiSubmitGuess, apiCreateGame, apiRequestHint } from '@shared/api/games'

const HINT_ENERGY_COST = 5

function isHintCommand(text) {
  return text.replace(/[\s\p{P}\p{S}]+/gu, '').toLowerCase() === 'hint'
}
import { useLang } from '../../../context/LangContext'
import ChatWindow from '../../../components/ChatWindow'
import Button from '../../../components/Button'
import Input from '../../../components/Input'
import Dialog from '../../../components/Dialog'
import IconButton from '../../../components/IconButton'
import { BackIcon } from '../../../components/icons'
import { useEnergy } from '../../../context/EnergyContext'
import Sticker, { stickerFrameTier } from '../../../components/Sticker'
import '../../collectibles/pages/CollectiblesPage.scss'
import './GamePage.scss'

export default function GamePage() {
  const { gameId }                = useParams()
  const { energy, depleteEnergy, syncEnergy, promptOutOfEnergy } = useEnergy()
  const navigate                  = useNavigate()
  const { t }                     = useLang()
  const [messages, setMessages]   = useState([])
  const [input,    setInput]      = useState('')
  const [won,      setWon]        = useState(false)
  const [elapsed,  setElapsed]    = useState(0)
  const [timerOn,  setTimerOn]    = useState(false)
  const [loading,  setLoading]    = useState(false)
  const [startMs,  setStartMs]    = useState(null)
  const [game,     setGame]       = useState(null)
  const [winDismissed, setWinDismissed] = useState(false)
  const inputRef                  = useRef(null)

  useEffect(() => {
    setGame(null)
    setMessages([])
    setWon(false)
    setWinDismissed(false)
    setElapsed(0)
    setTimerOn(false)
    setStartMs(null)
    apiGetGame(gameId).then(setGame).catch(() => {})
    apiGetGuesses(gameId)
      .then(guesses => {
        setMessages(guesses.map(g => g.kind === 'hint'
          ? { question: t('game.hint'), answer: g.content, kind: 'hint' }
          : { question: g.content, answer: g.response }))
        if (guesses.length > 0 && guesses[0].created_at) {
          const start = new Date(guesses[0].created_at).getTime()
          setStartMs(start)
          const winGuess = guesses.find(g => g.response === 'win')
          if (winGuess?.created_at) {
            setElapsed(Math.floor((new Date(winGuess.created_at).getTime() - start) / 1000))
            setWon(true)
          } else {
            setElapsed(Math.floor((Date.now() - start) / 1000))
            setTimerOn(true)
          }
        }
      })
      .catch(() => {})
  }, [gameId])

  const remaining = game?.guess_limit != null ? game.guess_limit - messages.length : null
  const done = won || (remaining !== null && remaining <= 0)

  useEffect(() => {
    if (!timerOn || done) return
    const id = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [timerOn, done])

  function formatTime(s) {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    const mm = m.toString().padStart(2, '0')
    const ss = sec.toString().padStart(2, '0')
    return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
  }

  async function handleAsk() {
    if (!input.trim() || done || loading) return
    const question = input.trim()
    if (isHintCommand(question)) {
      await handleHint()
      return
    }
    if (energy === 0) { promptOutOfEnergy(); return }
    setInput('')
    if (startMs === null) setStartMs(Date.now())
    if (!timerOn) setTimerOn(true)
    depleteEnergy()
    setLoading(true)
    setMessages(prev => [...prev, { question, answer: '...', finalAnswer: null }])
    try {
      const guess = await apiSubmitGuess(gameId, question)
      // Keep the pending entry so the ChatWindow can animate the spinner stopping on the final answer.
      setMessages(prev => {
        if (prev.length === 0) return prev
        const copy = prev.slice()
        copy[copy.length - 1] = {
          ...copy[copy.length - 1],
          question: guess.content,
          finalAnswer: guess.response,
        }
        return copy
      })
      syncEnergy(guess.energy_remaining)
      if (guess.response === 'win') {
        setWon(true)
        const endMs = guess.created_at ? new Date(guess.created_at).getTime() : Date.now()
        const base  = startMs ?? endMs
        setElapsed(Math.max(0, Math.floor((endMs - base) / 1000)))
        apiGetGame(gameId).then(setGame).catch(() => {})
      }
    } catch {
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  async function handleHint() {
    if (energy !== null && energy < HINT_ENERGY_COST) { promptOutOfEnergy(); return }
    setInput('')
    if (startMs === null) setStartMs(Date.now())
    if (!timerOn) setTimerOn(true)
    depleteEnergy(HINT_ENERGY_COST)
    setLoading(true)
    setMessages(prev => [...prev, { question: t('game.hint'), answer: '...', finalAnswer: null, kind: 'hint' }])
    try {
      const hint = await apiRequestHint(gameId)
      setMessages(prev => {
        if (prev.length === 0) return prev
        const copy = prev.slice()
        copy[copy.length - 1] = {
          ...copy[copy.length - 1],
          finalAnswer: hint.content,
        }
        return copy
      })
      syncEnergy(hint.energy_remaining)
    } catch {
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleAsk()
  }

  const DIFF_LABEL = {
    easy:   t('game.diffEasy'),
    medium: t('game.diffMedium'),
    hard:   t('game.diffHard'),
  }

  const label         = game?.pack_name ?? ''
  const packId        = game?.pack_id
  const position      = game?.position
  const difficulty    = game?.difficulty ?? ''
  const isDailyChallenge = game?.challenge?.is_daily === true
  const backTo        = !isDailyChallenge && packId ? `/packs/${packId}/challenges` : '/challenges'
  const nextChallenge = game?.next_challenge ?? null

  async function handleNext() {
    if (!nextChallenge) return
    try {
      const newGame = await apiCreateGame({ challenge_id: nextChallenge.id })
      navigate(`/games/${newGame.id}`)
    } catch {}
  }

  return (
    <div className="game">

      <div className="game__meta">
        <IconButton
          className="game__back"
          icon={<BackIcon />}
          onClick={() => navigate(backTo)}
          aria-label="Back"
        />
        <span
          className={`game__diff game__diff--${difficulty}`}
          aria-label={DIFF_LABEL[difficulty] ?? difficulty}
        />

        <span className="game__pack">
          <span className="game__pack-name">{label}</span>
          {position != null && <span className="game__position">#{position}</span>}
        </span>
        <span className={`game__timer${done ? ' game__timer--done' : ''}`}>
          {formatTime(elapsed)}
        </span>
      </div>

      <ChatWindow
        className="game__chat"
        messages={messages}
        emptyLabel={t('game.emptyChat')}
        inputRef={inputRef}
      />

      <div className="game__controls">
        <Input
          ref={inputRef}
          placeholder={t('game.inputPlaceholder')}
          aria-label="Question input"
          value={input}
          onChange={e => setInput(e.target.value.slice(0, 80))}
          onKeyDown={handleKeyDown}
          disabled={done}
          maxLength={80}
        />
        <Button color="blue" onClick={handleAsk} disabled={done || loading || input.trim().length < 2}>{t('game.ask')}</Button>
      </div>

      {done && won && !winDismissed && (() => {
        const challenge = game?.challenge
        return (
          <Dialog title={t('game.wonTitle')} onClose={() => setWinDismissed(true)}>
            <Sticker
              className="game__sticker-pop"
              sticker={challenge?.sticker}
              name={challenge?.subject}
              tier={stickerFrameTier(messages.length)}
            />
            <p className="game__won-stat">
              {t('game.solvedIn')} <span className="game__won-stat-count">{messages.length}</span> {messages.length === 1 ? t('game.guess') : t('game.guesses')}!
            </p>
            <div className="game__won-actions">
              <Button fullWidth color="muted" onClick={() => navigate(backTo)}>{t('game.backToPack')}</Button>
              {nextChallenge && (
                <Button fullWidth onClick={handleNext}>{t('game.nextChallenge')}</Button>
              )}
            </div>
          </Dialog>
        )
      })()}

    </div>
  )
}
