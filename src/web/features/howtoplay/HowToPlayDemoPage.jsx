import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useLang } from '../../context/LangContext'
import { useTour } from '../../components/Tour'
import ChatWindow from '../../components/ChatWindow'
import Button from '../../components/Button'
import Input from '../../components/Input'
import IconButton from '../../components/IconButton'
import { BackIcon } from '../../components/icons'
import '../games/pages/GamePage.scss'

export default function HowToPlayDemoPage() {
  const { t }      = useLang()
  const navigate   = useNavigate()
  const tour       = useTour()
  const stage      = tour?.demoStage ?? 0
  const [input, setInput] = useState('')

  const messages = []
  if (stage >= 1) {
    messages.push({ question: t('tour.demoQuestion'), answer: 'yes' })
  }
  if (stage >= 2) {
    messages.push({ question: t('tour.demoFinal'), answer: 'win' })
  }

  const done = stage >= 2

  return (
    <div className="game">
      <div className="game__meta">
        <IconButton
          className="game__back"
          icon={<BackIcon />}
          onClick={() => navigate('/challenges')}
          aria-label="Back"
        />
        <span className="game__diff game__diff--easy" />
        <span className="game__pack">
          <span className="game__pack-name">{t('tour.demoPack')}</span>
          <span className="game__position">#1</span>
        </span>
        <span className={`game__timer${done ? ' game__timer--done' : ''}`}>00:12</span>
      </div>

      <div data-tour="demo-chat" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <ChatWindow
          className="game__chat"
          messages={messages}
          emptyLabel={t('tour.demoEmpty')}
        />
      </div>

      <div className="game__controls" data-tour="demo-input">
        <Input
          placeholder={t('game.inputPlaceholder')}
          aria-label="Question input"
          value={input}
          onChange={e => setInput(e.target.value.slice(0, 80))}
          disabled={done}
          maxLength={80}
        />
        <Button color="blue" disabled>{t('game.ask')}</Button>
      </div>
    </div>
  )
}
