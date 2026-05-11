import { Outlet } from 'react-router'
import Tabs from '../../../components/Tabs'
import { useLang } from '../../../context/LangContext'

export default function CollectiblesLayout() {
  const { t } = useLang()

  const tabs = [
    { to: '/collectibles',              label: t('collectibles.stickers'),      end: true },
    { to: '/collectibles/achievements', label: t('collectibles.achievements') },
  ]

  return (
    <div>
      <Tabs tabs={tabs} />
      <Outlet />
    </div>
  )
}
