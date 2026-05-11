import { NavLink } from 'react-router'
import './Tabs.scss'

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
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
