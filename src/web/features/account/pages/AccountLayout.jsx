import { Outlet } from 'react-router'
import Tabs from '../../../components/Tabs'
import { useLang } from '../../../context/LangContext'

export default function AccountLayout() {
  const { t } = useLang()

  const tabs = [
    { to: '/account',              label: t('profile.title'),       end: true },
    { to: '/account/settings',     label: t('settings.title') },
    { to: '/account/subscription', label: t('subscription.title') },
  ]

  return (
    <div>
      <Tabs tabs={tabs} />
      <Outlet />
    </div>
  )
}
