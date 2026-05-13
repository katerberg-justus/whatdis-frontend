import { useEnergy } from '../context/EnergyContext'
import './StatusBar.scss'

const EnergyDrinkIcon = () => (
  <div className="status-bar__can">
    <svg viewBox="0 0 10 14" width="15" height="21" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="1" y="0"  width="8" height="1" fill="#00A6FF" />
      <rect x="0" y="1"  width="10" height="1" fill="#00A6FF" />
      <rect x="0" y="2"  width="10" height="10" fill="#00A6FF" />
      <rect x="1" y="2"  width="2" height="1" fill="#6FD1FF" />
      <rect x="1" y="3"  width="1" height="2" fill="#6FD1FF" />
      <rect x="8" y="2"  width="2" height="10" fill="#0075C9" />
      <rect x="0" y="10" width="8" height="2" fill="#008BDD" />
      <rect x="3" y="4"  width="4" height="1" fill="#FF007B" />
      <rect x="0" y="5"  width="10" height="3" fill="#FF007B" />
      <rect x="1" y="5"  width="2" height="3" fill="#FF5BAD" />
      <rect x="8" y="5"  width="2" height="3" fill="#C80061" />
      <rect x="3" y="8"  width="4" height="1" fill="#FF007B" />
      <rect x="0" y="12" width="10" height="1" fill="#00A6FF" />
      <rect x="1" y="13" width="8" height="1" fill="#00A6FF" />
      <rect x="8" y="12" width="2" height="1" fill="#0075C9" />
      <rect x="7" y="13" width="2" height="1" fill="#0075C9" />
    </svg>
    <span className="status-bar__can-nrg">NRG</span>
  </div>
)

const BLOCK_COUNT = 10

function energyColor(ratio) {
  if (ratio > 0.6) return 'blue'
  if (ratio > 0.3) return 'green'
  return 'pink'
}

export default function StatusBar() {
  const { energy, maxEnergy } = useEnergy()

  if (energy === null) return <div className="status-bar" />

  const filled = Math.round((energy / maxEnergy) * BLOCK_COUNT)
  const ratio  = energy / maxEnergy
  const color  = energyColor(ratio)

  return (
    <div className="status-bar">
      <EnergyDrinkIcon />
      <div className="status-bar__track" aria-label={`${energy} of ${maxEnergy} energy`}>
        {Array.from({ length: BLOCK_COUNT }, (_, i) => (
          <span
            key={i}
            className={`status-bar__block status-bar__block--${i < filled ? color : 'empty'}`}
          />
        ))}
      </div>
      <span className="status-bar__count">{energy}/{maxEnergy}</span>
    </div>
  )
}
