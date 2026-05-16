import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router'
import { useLang } from '../context/LangContext'
import './Tour.scss'

const STEPS = [
  { path: '/challenges',       target: '[data-tour="daily"]',         copyKey: 'tour.daily' },
  { path: '/challenges',       target: '[data-tour="packs"]',         copyKey: 'tour.packs' },
  { path: '/battles',          target: '[data-tour="battles-tabs"]',  copyKey: 'tour.battles' },
  { path: '/collectibles',     target: '[data-tour="collectibles-tabs"]', copyKey: 'tour.collectibles' },
  { path: '/how-to-play/demo', target: '[data-tour="demo-chat"]',     copyKey: 'tour.demoIntro',  demoStage: 0 },
  { path: '/how-to-play/demo', target: '[data-tour="demo-input"]',    copyKey: 'tour.demoAsk',    demoStage: 0 },
  { path: '/how-to-play/demo', target: '[data-tour="demo-chat"]',     copyKey: 'tour.demoAnswer', demoStage: 1 },
  { path: '/how-to-play/demo', target: '[data-tour="demo-chat"]',     copyKey: 'tour.demoWin',    demoStage: 2 },
]

const TourContext = createContext(null)

export function TourProvider({ children }) {
  const [index, setIndex] = useState(null)
  const isActive = index !== null
  const step = isActive ? STEPS[index] : null
  const demoStage = step?.demoStage ?? 0
  const navigate = useNavigate()
  const location = useLocation()
  const returnToRef = useRef(null)

  const start = useCallback(() => {
    returnToRef.current = location.pathname + location.search + location.hash
    setIndex(0)
  }, [location.pathname, location.search, location.hash])
  const close = useCallback(() => {
    setIndex(null)
    if (returnToRef.current) {
      navigate(returnToRef.current)
      returnToRef.current = null
    }
  }, [navigate])
  const next  = useCallback(() => setIndex(i => (i == null ? null : Math.min(i + 1, STEPS.length - 1))), [])
  const prev  = useCallback(() => setIndex(i => (i == null ? null : Math.max(i - 1, 0))), [])

  const value = useMemo(() => ({
    isActive,
    index,
    total: STEPS.length,
    step,
    demoStage,
    start,
    close,
    next,
    prev,
  }), [isActive, index, step, demoStage, start, close, next, prev])

  return (
    <TourContext.Provider value={value}>
      {children}
      {isActive && <TourOverlay />}
    </TourContext.Provider>
  )
}

export const useTour = () => useContext(TourContext)

function TourOverlay() {
  const { step, index, total, next, prev, close } = useTour()
  const { t } = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  const [rect, setRect] = useState(null)
  const rafRef = useRef(null)

  // Route to the step's path if we're not there yet.
  useEffect(() => {
    if (location.pathname !== step.path) {
      navigate(step.path)
    }
  }, [step.path, location.pathname, navigate])

  // Find target element and track its rect.
  useLayoutEffect(() => {
    setRect(null)
    if (location.pathname !== step.path) return

    let scrolled = false
    const measure = () => {
      const el = document.querySelector(step.target)
      if (!el) {
        rafRef.current = requestAnimationFrame(measure)
        return
      }
      const r = el.getBoundingClientRect()
      if (!scrolled && (r.top < 80 || r.bottom > window.innerHeight - 80)) {
        scrolled = true
        el.scrollIntoView({ block: 'center', behavior: 'smooth' })
        rafRef.current = requestAnimationFrame(measure)
        return
      }
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
    }
    measure()

    const onChange = () => {
      const el = document.querySelector(step.target)
      if (el) {
        const r = el.getBoundingClientRect()
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
      }
    }
    window.addEventListener('resize', onChange)
    window.addEventListener('scroll', onChange, true)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onChange)
      window.removeEventListener('scroll', onChange, true)
    }
  }, [step.path, step.target, location.pathname])

  // Block keyboard interactions with the underlying page.
  useEffect(() => {
    const stop = (e) => {
      if (e.key === 'Escape') { close(); return }
      // allow tab/shift-tab so users can move between the tour buttons
      if (e.key === 'Tab') return
      e.stopPropagation()
    }
    window.addEventListener('keydown', stop, true)
    return () => window.removeEventListener('keydown', stop, true)
  }, [close])

  const isFirst = index === 0
  const isLast  = index === total - 1

  // Measure the tooltip after it renders, then clamp it into the viewport.
  const tooltipRef = useRef(null)
  const [tipPos, setTipPos] = useState(null)
  const TOOLTIP_W = 280

  useLayoutEffect(() => {
    if (!rect || !tooltipRef.current) return
    const tip = tooltipRef.current.getBoundingClientRect()
    const PAD = 14
    const EDGE = 12
    const vw = window.innerWidth
    const vh = window.innerHeight

    const spaceBelow = vh - (rect.top + rect.height) - PAD - EDGE
    const spaceAbove = rect.top - PAD - EDGE

    const placeBelow =
      spaceBelow >= tip.height ? true
      : spaceAbove >= tip.height ? false
      : spaceBelow >= spaceAbove

    let top = placeBelow
      ? rect.top + rect.height + PAD
      : rect.top - PAD - tip.height
    top = Math.max(EDGE, Math.min(top, vh - tip.height - EDGE))

    let left = rect.left + rect.width / 2 - tip.width / 2
    left = Math.max(EDGE, Math.min(left, vw - tip.width - EDGE))

    setTipPos({ top, left, side: placeBelow ? 'top' : 'bottom' })
  }, [rect, step.copyKey])

  const tooltipStyle = tipPos
    ? { top: tipPos.top, left: tipPos.left, width: TOOLTIP_W, visibility: 'visible' }
    : { top: -9999, left: -9999, width: TOOLTIP_W, visibility: 'hidden' }
  const arrowSide = tipPos?.side ?? 'top'

  const node = (
    <div className="tour" role="dialog" aria-modal="true">
      {rect ? (
        <div
          className="tour__spotlight"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
          }}
        />
      ) : (
        <div className="tour__backdrop" />
      )}

      {rect && (
        <div
          ref={tooltipRef}
          className={`tour__tooltip tour__tooltip--${arrowSide}`}
          style={tooltipStyle}
        >
          <button
            type="button"
            className="tour__close"
            onClick={close}
            aria-label={t('tour.skip')}
          >×</button>
          <p className="tour__text">{t(step.copyKey)}</p>
          <div className="tour__footer">
            <span className="tour__progress">{index + 1} / {total}</span>
            <div className="tour__buttons">
              <button
                type="button"
                className="tour__btn tour__btn--muted"
                onClick={prev}
                disabled={isFirst}
              >
                {t('tour.prev')}
              </button>
              <button
                type="button"
                className="tour__btn tour__btn--primary"
                onClick={isLast ? close : next}
              >
                {isLast ? t('tour.finish') : t('tour.next')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return createPortal(node, document.body)
}
