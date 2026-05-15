import { Outlet } from 'react-router'
import Tabs from '../../../components/Tabs'
import LockedOverlay from '../../../components/LockedOverlay'
import { useAuth } from '../../../context/AuthContext'
import { useLang } from '../../../context/LangContext'

export default function CollectiblesLayout() {
  const { t } = useLang()
  const { user } = useAuth()
  const isGuest = !user || user.is_guest

  const tabs = [
    { to: '/collectibles',              label: t('collectibles.stickers'),      end: true },
    { to: '/collectibles/achievements', label: t('collectibles.achievements') },
  ]

  return (
    <div className="locked-wrap">
      <div className={isGuest ? 'locked-wrap__content' : undefined}>
        <Tabs tabs={tabs} />
        <Outlet />
      </div>
      {isGuest && (
        <LockedOverlay
          title={t('collectibles.lockedTitle')}
          message={t('collectibles.lockedMessage')}
        />
      )}
    </div>
  )
}
