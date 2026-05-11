import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router'
import { apiGetGuesses, apiSubmitGuess } from '@shared/api/games'
import { useLang } from '../../../context/LangContext'
import ChatWindow from '../../../components/ChatWindow'
import Button from '../../../components/Button'
import Input from '../../../components/Input'
import Dialog from '../../../components/Dialog'
import { useEnergy } from '../../../context/EnergyContext'
import './GamePage.scss'

const TrophySvg = () => (
  <svg viewBox="0 0 12 12" width="64" height="64" fill="currentColor" shapeRendering="crispEdges" className="game__trophy">
    <rect x="0" y="0" width="12" height="3" />
    <rect x="1" y="3" width="10" height="1" />
    <rect x="2" y="4" width="8"  height="1" />
    <rect x="3" y="5" width="6"  height="1" />
    <rect x="4" y="6" width="4"  height="1" />
    <rect x="5" y="7" width="2"  height="2" />
    <rect x="3" y="9" width="6"  height="1" />
    <rect x="2" y="10" width="8" height="1" />
    <rect x="1" y="11" width="10" height="1" />
  </svg>
)

export default function GamePage() {
  const { gameId }                = useParams()
  const { state }                 = useLocation()
  const { depleteEnergy, syncEnergy } = useEnergy()
  const navigate                  = useNavigate()
  const { t }                     = useLang()
  const [messages, setMessages]   = useState([])
  const [input,    setInput]      = useState('')
  const [won,      setWon]        = useState(false)
  const [elapsed,  setElapsed]    = useState(0)
  const [timerOn,  setTimerOn]    = useState(false)

  useEffect(() => {
    apiGetGuesses(gameId)
      .then(guesses => {
        setMessages(guesses.map(g => ({ question: g.content, answer: g.response })))
        if (guesses.length > 0 && guesses[0].created_at) {
          const start = new Date(guesses[0].created_at).getTime()
          setElapsed(Math.floor((Date.now() - start) / 1000))
          setTimerOn(true)
        }
      })
      .catch(() => {})
  }, [gameId])

  const remaining = state?.guessLimit != null ? state.guessLimit - messages.length : null
  const done = won || (remaining !== null && remaining <= 0)

  useEffect(() => {
    if (!timerOn || done) return
    const id = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [timerOn, done])

  function formatTime(s) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  async function handleAsk() {
    if (!input.trim() || done) return
    const question = input.trim()
    setInput('')
    if (!timerOn) setTimerOn(true)
    depleteEnergy()
    setMessages(prev => [...prev, { question, answer: '...' }])
    try {
      const guess = await apiSubmitGuess(gameId, question)
      setMessages(prev => [...prev.slice(0, -1), { question: guess.content, answer: guess.response }])
      syncEnergy(guess.energy_remaining)
      if (guess.response === 'win') setWon(true)
    } catch {
      setMessages(prev => prev.slice(0, -1))
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

  const label      = state?.label ?? ''
  const difficulty = state?.difficulty ?? ''

  return (
    <div className="game">

      <div className="game__meta">
        <span className={`game__diff game__diff--${difficulty}`}>
          {DIFF_LABEL[difficulty] ?? difficulty}
        </span>
        <span className="game__pack">{label}</span>
        {timerOn && (
          <span className={`game__timer${done ? ' game__timer--done' : ''}`}>
            {formatTime(elapsed)}
          </span>
        )}
      </div>

      <ChatWindow messages={messages} emptyLabel={t('game.emptyChat')} />

      <div className="game__controls">
        <Input
          placeholder={t('game.inputPlaceholder')}
          aria-label="Question input"
          value={input}
          onChange={e => setInput(e.target.value.slice(0, 50))}
          onKeyDown={handleKeyDown}
          disabled={done}
          maxLength={50}
        />
        <Button color="blue" onClick={handleAsk} disabled={done || input.trim().length < 2}>{t('game.ask')}</Button>
      </div>

      {done && won && (
        <Dialog title={t('game.wonTitle')}>
          <TrophySvg />
          <p className="game__won-stat">
            {t('game.solvedIn')} {messages.length} {messages.length === 1 ? t('game.guess') : t('game.guesses')}
          </p>
          <Button fullWidth onClick={() => navigate('/challenges')}>{t('game.playAgain')}</Button>
        </Dialog>
      )}

    </div>
  )
}
