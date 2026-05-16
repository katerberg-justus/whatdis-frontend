import { useEffect, useRef, useState } from 'react'
import { useEnergy } from '../context/EnergyContext'
import { useAuth } from '../context/AuthContext'
import EnergyDrinkIcon from './EnergyDrinkIcon'
import NrgPurchaseDialog from './NrgPurchaseDialog'
import './StatusBar.scss'

const FILL_DURATION_MS = 800

const BLOCK_COUNT = 10

function energyColor(ratio) {
  if (ratio > 0.6) return 'blue'
  if (ratio > 0.3) return 'green'
  return 'pink'
}

export default function StatusBar() {
  const { energy, maxEnergy } = useEnergy()
  const { user } = useAuth()
  const hasEnergy = energy !== null
  const canBuyNrg = Boolean(user && !user.is_guest)
  const [purchaseOpen, setPurchaseOpen] = useState(false)
  const [displayEnergy, setDisplayEnergy] = useState(0)
  const animatedRef = useRef(false)

  useEffect(() => {
    if (!hasEnergy) return
    let raf
    if (animatedRef.current) {
      raf = requestAnimationFrame(() => setDisplayEnergy(energy))
      return () => cancelAnimationFrame(raf)
    }
    animatedRef.current = true
    const target = energy
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / FILL_DURATION_MS)
      setDisplayEnergy(Math.round(t * target))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [hasEnergy, energy])

  const current = hasEnergy ? displayEnergy : 0
  const filled = hasEnergy ? Math.round((current / maxEnergy) * BLOCK_COUNT) : 0
  const ratio  = hasEnergy ? current / maxEnergy : 0
  const color  = energyColor(ratio)
  const padWidth = hasEnergy ? String(energy).length : 1
  const paddedCurrent = String(current).padStart(padWidth, '0')
  const openPurchaseDialog = () => {
    if (canBuyNrg) setPurchaseOpen(true)
  }

  return (
    <>
      <div className="status-bar">
        <button
          type="button"
          className="status-bar__energy"
          aria-label={canBuyNrg ? 'Buy NRG' : undefined}
          disabled={!canBuyNrg}
          onClick={openPurchaseDialog}
        >
          <EnergyDrinkIcon className="status-bar__can" />
          <span className="status-bar__track" aria-label={hasEnergy ? `${energy} of ${maxEnergy} energy` : 'Energy loading'}>
            {Array.from({ length: BLOCK_COUNT }, (_, i) => (
              <span
                key={i}
                className={`status-bar__block status-bar__block--${i < filled ? color : 'empty'}`}
              />
            ))}
          </span>
          <span className="status-bar__count">{hasEnergy ? `${paddedCurrent}/${maxEnergy}` : '\u00a0'}</span>
        </button>
        {canBuyNrg && (
          <button
            type="button"
            className="status-bar__add"
            aria-label="Buy NRG"
            onClick={openPurchaseDialog}
          />
        )}
      </div>
      {canBuyNrg && purchaseOpen && <NrgPurchaseDialog onClose={() => setPurchaseOpen(false)} />}
    </>
  )
}
