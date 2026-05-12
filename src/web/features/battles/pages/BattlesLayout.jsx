import { Outlet } from 'react-router'
import { useNavigate } from 'react-router'
import Tabs from '../../../components/Tabs'
import Button from '../../../components/Button'
import LockedOverlay from '../../../components/LockedOverlay'
import { useAuth } from '../../../context/AuthContext'
import { useLang } from '../../../context/LangContext'

const IconLock = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
    <rect x="5" y="0" width="6" height="2" />
    <rect x="5" y="2" width="2" height="4" />
    <rect x="9" y="2" width="2" height="4" />
    <rect x="1" y="5" width="14" height="11" />
  </svg>
)

export default function BattlesLayout() {
  const { t }      = useLang()
  const { user }   = useAuth()
  const navigate   = useNavigate()

  const tabs = [
    { to: '/battles',         label: t('battles.tabBattles'),  end: true },
    { to: '/battles/friends', label: t('battles.tabFriends') },
    { to: '/battles/history', label: t('battles.tabHistory') },
  ]

  return (
    <>
    <div className="locked-wrap">
      <div className={user ? undefined : 'locked-wrap__content'}>
        <Tabs tabs={tabs} />
        <Outlet />
      </div>
      {!user && (
        <LockedOverlay
          title={t('battles.lockedTitle')}
          message={t('battles.lockedMessage')}
        />
      )}
    </div>

    <div className="battles__footer">
      <Button
        color="pink"
        fullWidth
        onClick={() => navigate(user ? '/battles/friends' : '/register')}
      >
        {!user && <IconLock />}
        {t('battles.startNew')}
      </Button>
    </div>
    </>
  )
}
