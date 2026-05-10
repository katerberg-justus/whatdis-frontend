import { useParams } from 'react-router'
import ChatWindow from '../../../components/ChatWindow'
import Button from '../../../components/Button'
import Input from '../../../components/Input'
import './GamePage.scss'

const META = {
  pack: 'Kitchen Appliances',
  difficulty: 'easy',
  questionsUsed: 7,
  questionsTotal: 10,
}

const MESSAGES = [
  { question: 'Is it a living thing?',              answer: 'no' },
  { question: 'Is it found indoors?',               answer: 'yes' },
  { question: 'Is it smaller than a microwave?',    answer: 'yes' },
  { question: 'Does it use electricity?',           answer: 'yes' },
  { question: 'Is it used for preparing food?',     answer: 'yes' },
  { question: 'Does it produce heat?',              answer: 'yes' },
  { question: 'Is it used specifically for bread?', answer: 'yes' },
]

const DIFF_LABEL = { easy: 'Easy', medium: 'Medium', hard: 'Hard' }

export default function GamePage() {
  const { gameId } = useParams()
  const remaining = META.questionsTotal - META.questionsUsed

  return (
    <div className="game">

      <div className="game__meta">
        <span className="game__pack">{META.pack}</span>
        <span className={`game__diff game__diff--${META.difficulty}`}>
          {DIFF_LABEL[META.difficulty]}
        </span>
        <span className="game__counter">
          <span className={remaining <= 2 ? 'game__counter--low' : ''}>{remaining}</span>
          &nbsp;left
        </span>
      </div>

      <ChatWindow messages={MESSAGES} />

      <div className="game__controls">
        <Input placeholder="Ask a yes / no question..." aria-label="Question input" />
        <Button color="blue">Ask</Button>
      </div>

    </div>
  )
}
