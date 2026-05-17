import { useMemo, useState } from 'react'
import { useLang } from '../context/LangContext'
import { useCurrency } from '../context/CurrencyContext'
import { useNrgBoostersQuery, useStartNrgBoosterCheckoutMutation } from '@shared/api/nrgBoosters'
import Dialog from './Dialog'
import Button from './Button'
import RadioButton from './RadioButton'
import EnergyDrinkIcon from './EnergyDrinkIcon'
import './NrgPurchaseDialog.scss'

const FALLBACK_BOOSTERS = [
  { booster_id: 'nrg_booster_1k', name: '1K NRG Booster', energy_boost: 1000 },
  { booster_id: 'nrg_booster_5k', name: '5K NRG Booster', energy_boost: 5000 },
  { booster_id: 'nrg_booster_10k', name: '10K NRG Booster', energy_boost: 10000 },
]

const CAN_LAYOUT = {
  nrg_booster_1k:  [[1]],
  nrg_booster_5k:  [[2], [1]],
  nrg_booster_10k: [[3], [2], [1]],
}

const PRICES = {
  nrg_booster_1k:  { EUR: '€1.99', USD: '$2.19', GBP: '£1.89' },
  nrg_booster_5k:  { EUR: '€3.99', USD: '$4.49', GBP: '£3.49' },
  nrg_booster_10k: { EUR: '€5.99', USD: '$6.99', GBP: '£5.29' },
}

function formatEnergy(value) {
  if (value >= 1000) return `${value / 1000}K`
  return String(value)
}

export default function NrgPurchaseDialog({ onClose }) {
  const { t } = useLang()
  const { currency } = useCurrency()
  const { data } = useNrgBoostersQuery()
  const checkout = useStartNrgBoosterCheckoutMutation()
  const boosters = data?.length ? data : FALLBACK_BOOSTERS
  const [selected, setSelected] = useState(boosters[1]?.booster_id ?? 'nrg_booster_5k')

  const selectedBooster = useMemo(
    () => boosters.find((booster) => booster.booster_id === selected) ?? boosters[0],
    [boosters, selected],
  )

  const handleBuy = async () => {
    if (!selectedBooster) return
    const { checkout_url } = await checkout.mutateAsync({
      boosterId: selectedBooster.booster_id,
      currency,
    })
    window.location.href = checkout_url
  }

  return (
    <Dialog title={t('nrg.title')} onClose={onClose}>
      <div className="nrg-dialog">
        <p className="nrg-dialog__copy">{t('nrg.usp')}</p>
        <div className="nrg-dialog__packs">
          {boosters.map((booster) => (
            <RadioButton
              key={booster.booster_id}
              name="nrg-booster"
              value={booster.booster_id}
              checked={selected === booster.booster_id}
              className="nrg-dialog__pack"
              onChange={() => setSelected(booster.booster_id)}
            >
              {booster.booster_id === 'nrg_booster_5k' && (
                <span className="nrg-dialog__popular">{t('nrg.popular')}</span>
              )}
              <span className="nrg-dialog__cans">
                {(CAN_LAYOUT[booster.booster_id] ?? [[1]]).map((count, rowIdx) => (
                  <span key={rowIdx} className="nrg-dialog__cans-row">
                    {Array.from({ length: count }, (_, i) => (
                      <EnergyDrinkIcon key={i} scale={1.4} />
                    ))}
                  </span>
                ))}
              </span>
              <span className="nrg-dialog__details">
                <span className="nrg-dialog__amount">{formatEnergy(booster.energy_boost)} NRG</span>
                <span className="nrg-dialog__price">{PRICES[booster.booster_id]?.[currency]}</span>
              </span>
            </RadioButton>
          ))}
        </div>
        <Button fullWidth disabled={checkout.isPending} onClick={handleBuy}>
          {checkout.isPending ? t('nrg.redirecting') : t('nrg.cta')}
        </Button>
      </div>
    </Dialog>
  )
}
