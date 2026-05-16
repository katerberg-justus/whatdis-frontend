import { useEffect, useRef, useState } from 'react'
import { useEnergy } from '../context/EnergyContext'
import { useAuth } from '../context/AuthContext'
import EnergyDrinkIcon from './EnergyDrinkIcon'
import NrgPurchaseDialog from './NrgPurchaseDialog'
import './StatusBar.scss'

const FILL_DURATION_MS = 800

const BLOCK_BREAKPOINTS = [
  { query: '(min-width: 400px)', count: 10 },
  { query: '(min-width: 360px)', count: 8 },
]
const BLOCK_COUNT_FALLBACK = 6

function pickBlockCount() {
  if (typeof window === 'undefined' || !window.matchMedia) return 10
  for (const { query, count } of BLOCK_BREAKPOINTS) {
    if (window.matchMedia(query).matches) return count
  }
  return BLOCK_COUNT_FALLBACK
}

function useBlockCount() {
  const [count, setCount] = useState(pickBlockCount)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mqls = BLOCK_BREAKPOINTS.map(({ query }) => window.matchMedia(query))
    const update = () => setCount(pickBlockCount())
    update()
    mqls.forEach((mql) => mql.addEventListener('change', update))
    return () => mqls.forEach((mql) => mql.removeEventListener('change', update))
  }, [])
  return count
}

function energyColor(ratio) {
  if (ratio > 0.6) return 'blue'
  if (ratio > 0.3) return 'green'
  return 'pink'
}

export default function StatusBar() {
  const { energy, maxEnergy } = useEnergy()
  const { user } = useAuth()
  const blockCount = useBlockCount()
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
  const overMax = hasEnergy && current > maxEnergy
  const filled = hasEnergy ? Math.min(blockCount, Math.round((current / maxEnergy) * blockCount)) : 0
  const ratio  = hasEnergy ? current / maxEnergy : 0
  const color  = overMax ? 'pink' : energyColor(ratio)
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
            {Array.from({ length: blockCount }, (_, i) => (
              <span
                key={i}
                className={`status-bar__block status-bar__block--${i < filled ? color : 'empty'}`}
              />
            ))}
          </span>
          <span className="status-bar__count">
            {hasEnergy ? (
              <>
                <span className={overMax ? 'status-bar__count-current--pink' : undefined}>{paddedCurrent}</span>
                {`/${maxEnergy}`}
              </>
            ) : '\u00a0'}
          </span>
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
