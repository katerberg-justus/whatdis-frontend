import { useEnergy } from '../context/EnergyContext'
import './StatusBar.scss'

const BLOCK_COUNT = 10

function energyColor(ratio) {
  if (ratio > 0.6) return 'green'
  if (ratio > 0.3) return 'blue'
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
      <span className="status-bar__label">NRG</span>
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
