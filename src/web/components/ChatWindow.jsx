import { useEffect, useRef } from 'react'
import './ChatWindow.scss'

export default function ChatWindow({ messages }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'instant' })
  }, [messages])

  return (
    <div className="chat">
      <div className="chat__log">
        {messages.map(({ question, answer }, i) => (
          <div key={i} className="chat__entry">
            <span className="chat__question">
              <span className="chat__prompt">&gt;</span>
              {question}
            </span>
            <span className={`chat__answer chat__answer--${answer}`}>
              {answer}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
