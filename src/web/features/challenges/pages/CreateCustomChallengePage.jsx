import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useLang } from '../../../context/LangContext'
import { useCreateCustomChallengeMutation } from '@shared/api/customChallenges'
import Button from '../../../components/Button'
import IconButton from '../../../components/IconButton'
import Input from '../../../components/Input'
import DropdownSelect from '../../../components/DropdownSelect'
import { BackIcon } from '../../../components/icons'
import './CustomChallengesPage.scss'

const NRG_COST = 5

const DIFFICULTY_CODES = { easy: 0, medium: 1, hard: 2, impossible: 3 }

export default function CreateCustomChallengePage() {
  const navigate = useNavigate()
  const { t } = useLang()

  const [subject,     setSubject]     = useState('')
  const [subjectHint, setSubjectHint] = useState('')
  const [difficulty,  setDifficulty]  = useState('medium')
  const [error,       setError]       = useState(null)

  const createMutation = useCreateCustomChallengeMutation()
  const submitting = createMutation.isPending

  const canSubmit = subject.trim().length > 0 && subjectHint.trim().length > 0 && !submitting
  const costHint = t('challenges.customCostHint').replace('{nrg}', NRG_COST)

  async function handleSubmit() {
    if (!canSubmit) return
    setError(null)
    try {
      await createMutation.mutateAsync({
        subject: subject.trim(),
        subject_hint: subjectHint.trim(),
        difficulty: DIFFICULTY_CODES[difficulty],
      })
      navigate('/challenges/custom')
    } catch (err) {
      if (err.response?.status === 402) {
        setError(t('challenges.customNotEnoughNrg'))
      } else if (err.response?.status === 403) {
        setError(t('challenges.customClaimRequired'))
      } else {
        setError(t('challenges.customCreateError'))
      }
    }
  }

  const difficultyOptions = [
    { value: 'easy',       label: t('game.diffEasy') },
    { value: 'medium',     label: t('game.diffMedium') },
    { value: 'hard',       label: t('game.diffHard') },
    { value: 'impossible', label: t('game.diffImpossible') },
  ]

  return (
    <div className="create-custom-challenge">
      <div className="create-custom-challenge__header">
        <IconButton
          icon={<BackIcon />}
          onClick={() => navigate('/challenges/custom')}
          aria-label={t('battles.back')}
        />
        <div className="create-custom-challenge__heading">
          <h2 className="create-custom-challenge__title">{t('challenges.customCreateTitle')}</h2>
          <p className="create-custom-challenge__description">{costHint}</p>
        </div>
      </div>

      <div className="create-custom-challenge__field">
        <label className="create-custom-challenge__label">{t('challenges.customSubjectLabel')}</label>
        <Input
          value={subject}
          onChange={e => setSubject(e.target.value.slice(0, 255))}
          placeholder={t('challenges.customSubjectPlaceholder')}
          maxLength={255}
        />
      </div>

      <div className="create-custom-challenge__field">
        <label className="create-custom-challenge__label">{t('challenges.customHintLabel')}</label>
        <Input
          value={subjectHint}
          onChange={e => setSubjectHint(e.target.value.slice(0, 40))}
          placeholder={t('challenges.customHintPlaceholder')}
          maxLength={40}
        />
      </div>

      <div className="create-custom-challenge__field">
        <label className="create-custom-challenge__label">{t('challenges.customDifficultyLabel')}</label>
        <DropdownSelect
          value={difficulty}
          options={difficultyOptions}
          onChange={e => setDifficulty(e.target.value)}
          aria-label={t('challenges.customDifficultyLabel')}
        />
      </div>

      {error && <p className="create-custom-challenge__error">{error}</p>}

      <div className="create-custom-challenge__actions">
        <Button color="pink" fullWidth disabled={!canSubmit} onClick={handleSubmit}>
          {submitting ? t('challenges.customCreating') : t('challenges.customCreate')}
        </Button>
      </div>
    </div>
  )
}
