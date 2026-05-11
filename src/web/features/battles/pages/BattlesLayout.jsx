import { Outlet } from 'react-router'
import Tabs from '../../../components/Tabs'
import { useLang } from '../../../context/LangContext'

export default function BattlesLayout() {
  const { t } = useLang()

  const tabs = [
    { to: '/battles',         label: t('battles.tabBattles'),  end: true },
    { to: '/battles/friends', label: t('battles.tabFriends') },
    { to: '/battles/history', label: t('battles.tabHistory') },
  ]

  return (
    <div>
      <Tabs tabs={tabs} />
      <Outlet />
    </div>
  )
}
