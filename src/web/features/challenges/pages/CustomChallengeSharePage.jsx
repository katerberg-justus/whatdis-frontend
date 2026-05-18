import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { apiRedeemCustomChallenge } from '@shared/api/customChallenges'
import { qk } from '@shared/api/queryKeys'
import { useCreateGameMutation } from '@shared/api/games'
import { useLang } from '../../../context/LangContext'
import Button from '../../../components/Button'
import './CustomChallengesPage.scss'

export default function CustomChallengeSharePage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const createGameMutation = useCreateGameMutation()
  const { t } = useLang()
  const startedRef = useRef(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (startedRef.current) return undefined
    startedRef.current = true

    let cancelled = false

    async function redeemAndStart() {
      if (!token) {
        setError(t('challenges.customShareInvalid'))
        return
      }

      try {
        const challenge = await apiRedeemCustomChallenge(token)
        queryClient.invalidateQueries({ queryKey: qk.myCustomChallenges })

        const game = await createGameMutation.mutateAsync({ challenge_id: challenge.id })
        if (cancelled) return

        navigate(`/games/${game.id}`, {
          replace: true,
          state: {
            label: t('challenges.customSharedLabel'),
            difficulty: challenge.difficulty,
          },
        })
      } catch {
        if (!cancelled) setError(t('challenges.customShareError'))
      }
    }

    redeemAndStart()

    return () => {
      cancelled = true
    }
  }, [createGameMutation, navigate, queryClient, t, token])

  if (error) {
    return (
      <div className="custom-challenges custom-challenges--share">
        <p className="custom-challenges__empty">{error}</p>
        <Button fullWidth onClick={() => navigate('/challenges')}>
          {t('nav.challenges')}
        </Button>
      </div>
    )
  }

  return (
    <div className="custom-challenges custom-challenges--share">
      <p className="custom-challenges__empty">{t('challenges.customShareLoading')}</p>
    </div>
  )
}
