import { useEffect, useRef, useState } from 'react'
import { useLang } from '../context/LangContext'
import './ChatWindow.scss'

const SPIN_KEYS = [
  'yes',
  'no',
  'partly',
  'indecisive',
  'possible',
  'possibly_not',
  'win',
]

function CyclingAnswer({
  keys = SPIN_KEYS,
  intervalMs = 120,
  targetKey = null,
  onDone,
}) {
  const { t } = useLang()
  const [displayKey, setDisplayKey] = useState(() => keys[Math.floor(Math.random() * keys.length)] ?? keys[0])
  const shownKey = targetKey ?? displayKey

  useEffect(() => {
    if (targetKey) {
      if (typeof onDone === 'function') onDone(targetKey)
      return
    }

    const interval = setInterval(() => {
      setDisplayKey(current => {
        const idx = Math.max(0, keys.indexOf(current))
        return keys[(idx + 1) % keys.length] ?? keys[0]
      })
    }, intervalMs)

    return () => clearInterval(interval)
  }, [keys, intervalMs, targetKey, onDone])

  return (
    <span
      className={`chat__answer-text chat__answer-text--${shownKey}`}
      aria-label="Loading"
    >
      {t(`game.response.${shownKey}`)}
    </span>
  )
}

export default function ChatWindow({ messages, emptyLabel, className = '' }) {
  const { t }     = useLang()
  const bottomRef = useRef(null)
  const previousMessageCountRef = useRef(messages.length)
  const newEntryTimerRef = useRef(null)
  const [newEntryIndex, setNewEntryIndex] = useState(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'instant' })
  }, [messages])

  useEffect(() => {
    const previousMessageCount = previousMessageCountRef.current
    previousMessageCountRef.current = messages.length

    if (messages.length > previousMessageCount) {
      setNewEntryIndex(messages.length - 1)
      window.clearTimeout(newEntryTimerRef.current)
      newEntryTimerRef.current = window.setTimeout(() => {
        setNewEntryIndex(null)
      }, 360)
    }

    return () => window.clearTimeout(newEntryTimerRef.current)
  }, [messages.length])

  return (
    <div className={['chat', className].filter(Boolean).join(' ')}>
      {messages.length === 0 && emptyLabel ? (
        <p className="chat__empty">{emptyLabel}</p>
      ) : (
        <div className="chat__log">
          {messages.map(({ question, answer, finalAnswer, author, isMe, kind }, i) => {
            const isHint = kind === 'hint'
            return (
              <div
                key={i}
                className={`chat__entry${i === newEntryIndex ? ' chat__entry--new' : ''}${isHint ? ' chat__entry--hint' : ''}`}
              >
                <span className="chat__question">
                  {author != null && (
                    <span className={`chat__author chat__author--${isMe ? 'me' : 'them'}`}>
                      {author}
                    </span>
                  )}
                  <span className="chat__prompt">&gt;</span>
                  {question}
                </span>
                {answer === '...' ? (
                  <span className={`chat__answer chat__answer--${isHint ? 'hint' : (finalAnswer ?? 'loading')}`}>
                    {isHint && finalAnswer
                      ? finalAnswer
                      : <CyclingAnswer targetKey={isHint ? null : finalAnswer} />}
                  </span>
                ) : (
                  <span className={`chat__answer chat__answer--${isHint ? 'hint' : answer}`}>
                    {isHint ? answer : t(`game.response.${answer}`)}
                  </span>
                )}
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  )
}
