import { useState } from 'react'
import { NavLink } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { useSubscription } from '../context/SubscriptionContext'
import UpgradeDialog from './UpgradeDialog'
import './Nav.scss'

// Pixel-art icons — 16×16 viewBox, each logical pixel = 2×2 units

const logoPinkPixels = 'M3.00 28.65h4.50v2.25h-4.50z M14.25 28.65h4.50v2.25h-4.50z M27.75 28.65h4.50v2.25h-4.50z M39.00 28.65h4.50v2.25h-4.50z M54.75 28.65h11.25v2.25h-11.25z M77.25 28.65h15.75v2.25h-15.75z M3.00 30.90h4.50v2.25h-4.50z M14.25 30.90h4.50v2.25h-4.50z M27.75 30.90h4.50v2.25h-4.50z M39.00 30.90h4.50v2.25h-4.50z M52.50 30.90h4.50v2.25h-4.50z M63.75 30.90h4.50v2.25h-4.50z M81.75 30.90h6.75v2.25h-6.75z M3.00 33.15h4.50v2.25h-4.50z M14.25 33.15h4.50v2.25h-4.50z M27.75 33.15h4.50v2.25h-4.50z M39.00 33.15h4.50v2.25h-4.50z M52.50 33.15h4.50v2.25h-4.50z M63.75 33.15h4.50v2.25h-4.50z M81.75 33.15h6.75v2.25h-6.75z M3.00 35.40h4.50v2.25h-4.50z M9.75 35.40h2.25v2.25h-2.25z M14.25 35.40h4.50v2.25h-4.50z M27.75 35.40h15.75v2.25h-15.75z M52.50 35.40h15.75v2.25h-15.75z M81.75 35.40h6.75v2.25h-6.75z M3.00 37.65h15.75v2.25h-15.75z M27.75 37.65h4.50v2.25h-4.50z M39.00 37.65h4.50v2.25h-4.50z M52.50 37.65h4.50v2.25h-4.50z M63.75 37.65h4.50v2.25h-4.50z M81.75 37.65h6.75v2.25h-6.75z M3.00 39.90h6.75v2.25h-6.75z M12.00 39.90h6.75v2.25h-6.75z M27.75 39.90h4.50v2.25h-4.50z M39.00 39.90h4.50v2.25h-4.50z M52.50 39.90h4.50v2.25h-4.50z M63.75 39.90h4.50v2.25h-4.50z M81.75 39.90h6.75v2.25h-6.75z M3.00 42.15h4.50v2.25h-4.50z M14.25 42.15h4.50v2.25h-4.50z M27.75 42.15h4.50v2.25h-4.50z M39.00 42.15h4.50v2.25h-4.50z M52.50 42.15h4.50v2.25h-4.50z M63.75 42.15h4.50v2.25h-4.50z M81.75 42.15h6.75v2.25h-6.75z M60.94 51.60h11.25v2.25h-11.25z M58.69 53.85h4.50v2.25h-4.50z M69.94 53.85h4.50v2.25h-4.50z M69.94 56.10h4.50v2.25h-4.50z M67.69 58.35h4.50v2.25h-4.50z M63.19 60.60h4.50v2.25h-4.50z M63.19 65.10h4.50v2.25h-4.50z'
const logoBluePixels = 'M3.00 51.60h11.25v2.25h-11.25z M21.56 51.60h15.75v2.25h-15.75z M42.38 51.60h13.50v2.25h-13.50z M81.75 51.60h6.75v2.25h-6.75z M3.00 53.85h4.50v2.25h-4.50z M12.00 53.85h4.50v2.25h-4.50z M26.06 53.85h6.75v2.25h-6.75z M40.12 53.85h4.50v2.25h-4.50z M81.75 53.85h6.75v2.25h-6.75z M3.00 56.10h4.50v2.25h-4.50z M14.25 56.10h4.50v2.25h-4.50z M26.06 56.10h6.75v2.25h-6.75z M40.12 56.10h4.50v2.25h-4.50z M81.75 56.10h6.75v2.25h-6.75z M3.00 58.35h4.50v2.25h-4.50z M14.25 58.35h4.50v2.25h-4.50z M26.06 58.35h6.75v2.25h-6.75z M42.38 58.35h11.25v2.25h-11.25z M81.75 58.35h6.75v2.25h-6.75z M3.00 60.60h4.50v2.25h-4.50z M14.25 60.60h4.50v2.25h-4.50z M26.06 60.60h6.75v2.25h-6.75z M51.38 60.60h4.50v2.25h-4.50z M81.75 60.60h6.75v2.25h-6.75z M3.00 62.85h4.50v2.25h-4.50z M12.00 62.85h4.50v2.25h-4.50z M26.06 62.85h6.75v2.25h-6.75z M51.38 62.85h4.50v2.25h-4.50z M3.00 65.10h11.25v2.25h-11.25z M21.56 65.10h15.75v2.25h-15.75z M40.12 65.10h13.50v2.25h-13.50z M81.75 65.10h6.75v2.25h-6.75z'

const IconLogo = () => (

  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="100" height="100" shapeRendering="crispEdges">
    <g transform="translate(3.38 3.38)" opacity="0.5">
      <path fill="#9C0059" d={logoPinkPixels} />
      <path fill="#0068AA" d={logoBluePixels} />
    </g>
    <g transform="translate(1.12 1.12)" opacity="0.75">
      <path fill="#D50071" d={logoPinkPixels} />
      <path fill="#0089D6" d={logoBluePixels} />
    </g>
    <g transform="translate(-1.12 -1.12)" opacity="0.82">
      <path fill="#FF4DAA" d={logoPinkPixels} />
      <path fill="#4FC7FF" d={logoBluePixels} />
    </g>
    <path fill="#FF007B" d={logoPinkPixels} />
    <path fill="#00A6FF" d={logoBluePixels} />
    <path fill="#FF86C8" d="M3 28.65h4.5v2.25H3z M27.75 28.65h4.5v2.25h-4.5z M54.75 28.65H66v2.25H54.75z M77.25 28.65H93v2.25H77.25z M60.94 51.6h11.25v2.25H60.94z" opacity="0.72" />
    <path fill="#8ADEFF" d="M3 51.6h11.25v2.25H3z M21.56 51.6h15.75v2.25H21.56z M42.38 51.6h13.5v2.25h-13.5z M81.75 51.6h6.75v2.25h-6.75z" opacity="0.72" />
  </svg>

)

// Flag / pennant
const IconChallenges = () => (
  <svg
    width="100%"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    shapeRendering="crispEdges"
  >
    <path d="M3 1h2v14H3z" fill="#FF007B" />
    <path d="M4 1h1v14H4z" fill="#C80061" />
    <path d="M5 2h8v2H5zM6 4h6v2H6zM5 6h8v2H5z" fill="#00A6FF" />
    <path d="M5 2h2v1H5zM6 4h2v1H6zM5 6h2v1H5z" fill="#6FD1FF" />
    <path d="M11 2h2v2h-2zM10 4h2v2h-2zM11 6h2v2h-2z" fill="#0075C9" />
  </svg>
)

// Sword (vertical: tip top, pommel bottom)
const IconBattles = () => (
  <svg
    width="100%"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    shapeRendering="crispEdges"
  >
    <path d="M6 2h4v7H6zM7 1h2v1H7z" fill="#00A6FF" />
    <path d="M6 2h1v7H6zM7 1h1v1H7z" fill="#6FD1FF" />
    <path d="M9 2h1v7H9z" fill="#0075C9" />
    <path d="M3 9h10v2H3zM7 11h2v4H7zM6 14h4v1H6z" fill="#FF007B" />
    <path d="M3 9h2v1H3zM7 11h1v3H7zM6 14h1v1H6z" fill="#FF5BAD" />
    <path d="M11 10h2v1h-2zM8 11h1v4H8zM9 14h1v1H9z" fill="#C80061" />
  </svg>
)

// Upward arrow for upgrade — matches visual weight of other nav icons
const IconUpgrade = () => (
  <svg shapeRendering="crispEdges" width="100%" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" d="M7 2h2v2H7zM6 4h4v2H6zM5 6h6v2H5zM4 8h8v2H4zM7 10h2v4H7z" />
    <path fill="rgba(255,255,255,0.28)" d="M7 2h1v2H7zM6 4h2v1H6zM5 6h2v1H5zM4 8h2v1H4zM7 10h1v4H7z" />
    <path fill="rgba(0,0,0,0.22)" d="M8 2h1v2H8zM8 5h2v1H8zM9 7h2v1H9zM10 9h2v1h-2zM8 10h1v4H8z" />
  </svg>
)

// Trophy: blue cup + pink handles + pink stem/base
const IconCollectibles = () => (
  <svg shapeRendering="crispEdges" width="100%" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path fill="#00A6FF" d="M4 2h8v1H4zM4 3h8v3H4zM5 6h6v1H5zM6 7h4v1H6z" />
    <path fill="#6FD1FF" d="M4 2h3v1H4zM4 3h2v3H4zM5 6h2v1H5zM6 7h1v1H6z" />
    <path fill="#0075C9" d="M10 2h2v1h-2zM10 3h2v3h-2zM9 6h2v1H9zM9 7h1v1H9z" />
    <path fill="#FF007B" d="M2 3h2v1H2zM12 3h2v1h-2zM2 4h1v3H2zM13 4h1v3h-1zM3 7h2v1H3zM11 7h2v1h-2zM7 8h2v3H7zM5 11h6v1H5zM4 12h8v2H4zM3 14h10v1H3z" />
    <path fill="#FF5BAD" d="M2 3h1v1H2zM2 4h1v1H2zM3 7h1v1H3zM7 8h1v3H7zM5 11h2v1H5zM4 12h2v2H4zM3 14h3v1H3z" />
    <path fill="#C80061" d="M13 3h1v1h-1zM13 5h1v2h-1zM12 7h1v1h-1zM8 8h1v3H8zM9 11h2v1H9zM10 12h2v2h-2zM10 14h3v1h-3z" />
  </svg>
)

// Person: square head + body block + two legs
const IconAccount = () => (
  <svg shapeRendering="crispEdges" width="100%" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" role="img">
    <path fill="#FF007B" d="M5 1h6v1H5zM4 2h8v4H4zM5 6h6v1H5z"/>
    <path fill="#FF5BAD" d="M5 1h2v1H5zM4 2h2v4H4zM5 6h2v1H5z"/>
    <path fill="#C80061" d="M9 1h2v1H9zM10 2h2v4h-2zM9 6h2v1H9z"/>
    <path fill="#00A6FF" d="M3 8h10v1H3zM2 9h12v3H2zM3 12h10v1H3zM3 13h4v2H3zM9 13h4v2H9z"/>
    <path fill="#6FD1FF" d="M3 8h3v1H3zM2 9h3v3H2zM3 12h3v1H3zM3 13h2v2H3z"/>
    <path fill="#0075C9" d="M10 8h3v1h-3zM11 9h3v3h-3zM10 12h3v1h-3zM11 13h2v2h-2z"/>
  </svg>
)

export default function Nav() {
  const [open, setOpen] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const close = () => setOpen(false)
  const { user } = useAuth()
  const { t } = useLang()
  const { isActive, subscription } = useSubscription()

  const mainLinks = [
    { to: '/challenges',   label: t('nav.challenges'),   icon: <IconChallenges /> },
    { to: '/battles',      label: t('nav.battles'),      icon: <IconBattles /> },
    { to: '/collectibles', label: t('nav.collectibles'), icon: <IconCollectibles /> },
  ]

  return (
    <nav className={`nav${open ? ' nav--open' : ''}`}>
      <button className="nav__hamburger" onClick={() => setOpen(o => !o)} aria-label="Toggle menu">
        <span />
        <span />
        <span />
      </button>

      <div className="nav__panel">
        <div className="nav__logo">
          {IconLogo()}
        </div>

        <ul className="nav__links">
          {mainLinks.map(({ to, label, icon }) => (
            <li key={to}>
              <NavLink to={to} end className="nav__link" onClick={close}>
                <span className="nav__icon">{icon}</span>
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
          {user && !isActive && subscription !== undefined && (
            <li>
              <button
                className="nav__link nav__link--upgrade"
                onClick={() => { setUpgradeOpen(true); close() }}
              >
                <span className="nav__icon"><IconUpgrade /></span>
                <span>{t('nav.upgrade')}</span>
              </button>
            </li>
          )}
        </ul>

        <ul className="nav__bottom">
          <li>
            {user ? (
              <NavLink to="/account" end className="nav__link nav__link--account" onClick={close}>
                <span className="nav__icon"><IconAccount /></span>
                <span>{t('nav.account')}</span>
              </NavLink>
            ) : (
              <NavLink to="/register" end className="nav__link nav__link--account" onClick={close}>
                <span className="nav__icon"><IconAccount /></span>
                <span>{t('nav.signUp')}</span>
              </NavLink>
            )}
          </li>
        </ul>
      </div>

      {upgradeOpen && <UpgradeDialog onClose={() => setUpgradeOpen(false)} />}
    </nav>
  )
}
