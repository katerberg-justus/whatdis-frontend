import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { apiRedeemCustomChallenge } from '@shared/api/customChallenges'
import { qk } from '@shared/api/queryKeys'
import { apiCreateGame } from '@shared/api/games'
import { useLang } from '../../../context/LangContext'
import Button from '../../../components/Button'
import './CustomChallengesPage.scss'

export default function CustomChallengeSharePage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { t } = useLang()
  const startedRef = useRef(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (startedRef.current) return undefined
    startedRef.current = true

    async function redeemAndStart() {
      if (!token) {
        setError(t('challenges.customShareInvalid'))
        return
      }

      try {
        const challenge = await apiRedeemCustomChallenge(token)
        queryClient.invalidateQueries({ queryKey: qk.myCustomChallenges })
        queryClient.invalidateQueries({ queryKey: qk.customChallenges })

        const game = await apiCreateGame({ challenge_id: challenge.id })

        queryClient.invalidateQueries({ queryKey: qk.games })

        navigate(`/games/${game.id}`, {
          replace: true,
          state: {
            label: t('challenges.customSharedLabel'),
            backTo: '/challenges/custom',
            difficulty: challenge.difficulty,
          },
        })
      } catch {
        setError(t('challenges.customShareError'))
      }
    }

    redeemAndStart()
  }, [navigate, queryClient, t, token])

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
