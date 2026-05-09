import { useState } from 'react'
import { Link } from 'react-router'
import './Nav.scss'

// Pixel-art icons — 16×16 viewBox, each logical pixel = 2×2 units

// Flag / pennant
const IconChallenges = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="14" height="2" />
    <rect x="0" y="2" width="12" height="2" />
    <rect x="0" y="4" width="10" height="2" />
    <rect x="0" y="6" width="2" height="8" />
    <rect x="0" y="14" width="4" height="2" />
  </svg>
)

// Sword (vertical: tip top, pommel bottom)
const IconBattles = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="0" width="4" height="6" />
    <rect x="0" y="6" width="16" height="2" />
    <rect x="6" y="8" width="4" height="4" />
    <rect x="4" y="12" width="8" height="2" />
    <rect x="6" y="14" width="4" height="2" />
  </svg>
)

// Person: square head + body block + two legs
const IconAccount = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="0" width="8" height="6" />
    <rect x="0" y="8" width="16" height="4" />
    <rect x="2" y="12" width="4" height="4" />
    <rect x="10" y="12" width="4" height="4" />
  </svg>
)

const mainLinks = [
  { to: '/challenges', label: 'Challenges', icon: <IconChallenges /> },
  { to: '/battles',    label: 'Battles',    icon: <IconBattles /> },
]

export default function Nav() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <nav className={`nav${open ? ' nav--open' : ''}`}>
      <button className="nav__hamburger" onClick={() => setOpen(o => !o)} aria-label="Toggle menu">
        <span />
        <span />
        <span />
      </button>

      <div className="nav__panel">
        <div className="nav__logo">
          <span className="nav__logo-what">WHAT</span>
          <span className="nav__logo-dis">DIS?!</span>
        </div>

        <ul className="nav__links">
          {mainLinks.map(({ to, label, icon }) => (
            <li key={to}>
              <Link to={to} className="nav__link" onClick={close}>
                <span className="nav__icon">{icon}</span>
                <span>{label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <ul className="nav__bottom">
          <li>
            <Link to="/account" className="nav__link nav__link--account" onClick={close}>
              <span className="nav__icon"><IconAccount /></span>
              <span>Account</span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}
