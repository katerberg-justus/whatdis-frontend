import { NavLink } from 'react-router'
import './Tabs.scss'

const TabIcon = ({ name }) => {
  const icon = {
    account: (
      <>
        <rect x="6" y="2" width="4" height="1" />
        <rect x="5" y="3" width="6" height="4" />
        <rect x="6" y="7" width="4" height="1" />
        <rect x="4" y="9" width="8" height="1" />
        <rect x="3" y="10" width="10" height="2" />
        <rect x="2" y="12" width="12" height="2" />
      </>
    ),
    settings: (
      <>
        <rect x="7" y="1" width="2" height="3" />
        <rect x="7" y="12" width="2" height="3" />
        <rect x="1" y="7" width="3" height="2" />
        <rect x="12" y="7" width="3" height="2" />
        <rect x="4" y="3" width="2" height="2" />
        <rect x="10" y="3" width="2" height="2" />
        <rect x="4" y="11" width="2" height="2" />
        <rect x="10" y="11" width="2" height="2" />
        <rect x="6" y="6" width="4" height="4" />
      </>
    ),
    subscription: (
      <>
        <rect x="7" y="1" width="2" height="14" />
        <rect x="4" y="2" width="8" height="2" />
        <rect x="3" y="4" width="3" height="3" />
        <rect x="4" y="7" width="8" height="2" />
        <rect x="10" y="9" width="3" height="3" />
        <rect x="4" y="12" width="8" height="2" />
      </>
    ),
    battles: (
      <>
        <rect x="7" y="1" width="2" height="1" />
        <rect x="6" y="2" width="4" height="1" />
        <rect x="6" y="3" width="4" height="6" />
        <rect x="7" y="9" width="2" height="1" />
        <rect x="4" y="10" width="8" height="2" />
        <rect x="7" y="12" width="2" height="2" />
        <rect x="6" y="14" width="4" height="1" />
      </>
    ),
    friends: (
      <>
        <rect x="1" y="3" width="4" height="4" />
        <rect x="11" y="3" width="4" height="4" />
        <rect x="0" y="8" width="6" height="5" />
        <rect x="10" y="8" width="6" height="5" />
      </>
    ),
    history: (
      <>
        <rect x="3" y="1" width="10" height="2" />
        <rect x="5" y="3" width="6" height="4" />
        <rect x="7" y="7" width="2" height="2" />
        <rect x="5" y="9" width="6" height="4" />
        <rect x="3" y="13" width="10" height="2" />
      </>
    ),
    collectibles: (
      <>
        <rect x="4" y="2" width="8" height="2" />
        <rect x="3" y="4" width="10" height="9" />
        <rect x="5" y="6" width="6" height="4" />
        <rect x="2" y="13" width="12" height="1" />
      </>
    ),
    achievements: (
      <>
        <rect x="4" y="1" width="8" height="6" />
        <rect x="2" y="2" width="2" height="4" />
        <rect x="12" y="2" width="2" height="4" />
        <rect x="7" y="7" width="2" height="4" />
        <rect x="5" y="11" width="6" height="2" />
        <rect x="3" y="13" width="10" height="2" />
      </>
    ),
    packs: (
      <>
        <rect x="3" y="2" width="10" height="3" />
        <rect x="2" y="5" width="12" height="8" />
        <rect x="4" y="7" width="3" height="2" />
        <rect x="9" y="7" width="3" height="2" />
        <rect x="4" y="10" width="8" height="1" />
        <rect x="3" y="13" width="10" height="1" />
      </>
    ),
    custom: (
      <>
        <rect x="6" y="3" width="4" height="2" />
        <rect x="4" y="5" width="8" height="2" />
        <rect x="2" y="7" width="12" height="4" />
        <rect x="4" y="11" width="8" height="2" />
      </>
    ),
  }[name]

  if (!icon) return null

  return (
    <svg
      className="tabs__icon"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {icon}
    </svg>
  )
}

const getTabIconName = (to) => {
  if (to === '/account') return 'account'
  if (to === '/battles') return 'battles'
  if (to === '/challenges') return 'packs'
  if (to === '/collectibles') return 'collectibles'

  return to.split('/').filter(Boolean).at(-1)
}

export default function Tabs({ tabs }) {
  return (
    <nav className="tabs">
      {tabs.map(({ to, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            ['tabs__tab', isActive && 'tabs__tab--active'].filter(Boolean).join(' ')
          }
        >
          <TabIcon name={getTabIconName(to)} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
