import { useState } from 'react'
import { useLang } from '../../../context/LangContext'
import { apiUpdateMe } from '@shared/api/users'
import Button from '../../../components/Button'
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
  { code: 'en', label: 'English'    },
  { code: 'es', label: 'Español'    },
  { code: 'fr', label: 'Français'   },
  { code: 'de', label: 'Deutsch'    },
  { code: 'nl', label: 'Nederlands' },
  { code: 'pt', label: 'Português'  },
]

export default function SettingsPage() {
  const { t, lang, setLang } = useLang()
  const [selected, setSelected] = useState(lang)
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)

  const handleSave = async () => {
    setLoading(true); setSuccess(false)
    setLang(selected)
    try { await apiUpdateMe({ language: selected }) } catch {}
    setLoading(false)
    setSuccess(true)
  }

  return (
    <div className="account__section">
      <h2 className="account__heading">{t('settings.language')}</h2>
      <div className="account__lang-grid">
        {LANGUAGES.map(({ code, label }) => (
          <button
            key={code}
            type="button"
            className={['account__lang-btn', selected === code && 'account__lang-btn--active'].filter(Boolean).join(' ')}
            onClick={() => setSelected(code)}
          >
            {label}
          </button>
        ))}
      </div>
      {success && <p className="account__success">{t('settings.success')}</p>}
      <Button fullWidth disabled={loading} icon={<CheckIcon />} onClick={handleSave}>
        {loading ? t('settings.saving') : t('settings.save')}
      </Button>
    </div>
  )
}
