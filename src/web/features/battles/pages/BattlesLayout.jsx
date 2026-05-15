import { Outlet, useLocation } from 'react-router'
import { useNavigate } from 'react-router'
import Tabs from '../../../components/Tabs'
import Button from '../../../components/Button'
import LockedOverlay from '../../../components/LockedOverlay'
import { useAuth } from '../../../context/AuthContext'
import { useLang } from '../../../context/LangContext'

export default function BattlesLayout() {
  const { t }      = useLang()
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const { pathname } = useLocation()
  const isGuest    = !user || user.is_guest
  const isFriendsPage = pathname === '/battles/friends'

  const tabs = [
    { to: '/battles',         label: t('battles.tabBattles'),  end: true },
    { to: '/battles/friends', label: t('battles.tabFriends') },
    { to: '/battles/history', label: t('battles.tabHistory') },
  ]

  return (
    <>
    <div className="locked-wrap">
      <div className={isGuest ? 'locked-wrap__content' : undefined}>
        <Tabs tabs={tabs} />
        <Outlet />
      </div>
      {isGuest && (
        <LockedOverlay
          title={t('battles.lockedTitle')}
          message={t('battles.lockedMessage')}
        />
      )}
    </div>

    {!isFriendsPage && (
      <div className="battles__footer">
        <Button
          color="pink"
          fullWidth
          onClick={() => navigate(isGuest ? '/register' : '/battles/friends')}
        >
          {t('battles.startNew')}
        </Button>
      </div>
    )}
    </>
  )
}
