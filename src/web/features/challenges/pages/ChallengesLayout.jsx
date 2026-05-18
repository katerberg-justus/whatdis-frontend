import { Outlet } from 'react-router'
import Tabs from '../../../components/Tabs'
import { useLang } from '../../../context/LangContext'

export default function ChallengesLayout() {
  const { t } = useLang()

  const tabs = [
    { to: '/challenges',        label: t('challenges.tabPacks'),  end: true },
    { to: '/challenges/custom', label: t('challenges.tabCustom') },
  ]

  return (
    <div>
      <Tabs tabs={tabs} />
      <Outlet />
    </div>
  )
}
