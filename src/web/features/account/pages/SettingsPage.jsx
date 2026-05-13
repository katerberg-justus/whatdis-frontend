import { useState } from 'react'
import { useLang } from '../../../context/LangContext'
import { useCurrency } from '../../../context/CurrencyContext'
import { apiUpdateMe } from '@shared/api/users'
import Button from '../../../components/Button'
import DropdownSelect from '../../../components/DropdownSelect'
import './AccountPage.scss'

const CheckIcon = () => (
  <svg viewBox="0 0 10 8" width="10" height="8" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true" className="btn__chevron">
    <rect x="0" y="4" width="2" height="2" />
    <rect x="2" y="6" width="2" height="2" />
    <rect x="4" y="4" width="2" height="2" />
    <rect x="6" y="2" width="2" height="2" />
    <rect x="8" y="0" width="2" height="2" />
  </svg>
)

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'nl', label: 'Nederlands' },
  { value: 'pt', label: 'Português' },
]

const CURRENCIES = [
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'GBP', label: 'GBP (£)' },
]

export default function SettingsPage() {
  const { t, lang, setLang } = useLang()
  const { currency, setCurrency } = useCurrency()
  const [selectedLang,     setSelectedLang]     = useState(lang)
  const [selectedCurrency, setSelectedCurrency] = useState(currency)
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)

  const handleSave = async () => {
    setLoading(true); setSuccess(false)
    setLang(selectedLang)
    setCurrency(selectedCurrency)
    try { await apiUpdateMe({ language: selectedLang, currency: selectedCurrency }) } catch {
      // Keep the local change even if persisting the preference fails.
    }
    setLoading(false)
    setSuccess(true)
  }

  return (
    <div className="account__section">
      <h2 className="account__heading">{t('settings.language')}</h2>
      <DropdownSelect
        value={selectedLang}
        options={LANGUAGES}
        onChange={e => setSelectedLang(e.target.value)}
        aria-label={t('settings.language')}
      />
      <h2 className="account__heading">{t('settings.currency')}</h2>
      <DropdownSelect
        value={selectedCurrency}
        options={CURRENCIES}
        onChange={e => setSelectedCurrency(e.target.value)}
        aria-label={t('settings.currency')}
      />
      {success && <p className="account__success">{t('settings.success')}</p>}
      <Button fullWidth disabled={loading} icon={<CheckIcon />} onClick={handleSave}>
        {loading ? t('settings.saving') : t('settings.save')}
      </Button>
    </div>
  )
}
