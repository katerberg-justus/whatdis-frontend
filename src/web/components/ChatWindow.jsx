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

export default function ChatWindow({ messages, emptyLabel, inputRef }) {
  const { t }     = useLang()
  const bottomRef = useRef(null)

  useEffect(() => {
    const focusInput = () => {
      const input = inputRef?.current
      if (!input || input.disabled) return
      input.focus()
    }

    focusInput()

    function handleKeyDown(e) {
      if (e.defaultPrevented || e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return

      const active = document.activeElement
      const isTextInput = active?.matches?.('input, textarea, select, [contenteditable="true"]')
      if (isTextInput) return

      e.preventDefault()
      focusInput()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [inputRef])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'instant' })
  }, [messages])

  return (
    <div className="chat">
      {messages.length === 0 && emptyLabel ? (
        <p className="chat__empty">{emptyLabel}</p>
      ) : (
        <div className="chat__log">
          {messages.map(({ question, answer, finalAnswer, author, isMe }, i) => (
            <div key={i} className="chat__entry">
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
                <span className={`chat__answer chat__answer--${finalAnswer ?? 'loading'}`}>
                  <CyclingAnswer targetKey={finalAnswer} />
                </span>
              ) : (
                <span className={`chat__answer chat__answer--${answer}`}>
                  {t(`game.response.${answer}`)}
                </span>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  )
}
