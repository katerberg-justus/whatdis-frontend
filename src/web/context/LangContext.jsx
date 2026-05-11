import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import translations from '@shared/i18n/translations'

const SUPPORTED = ['en', 'es', 'fr', 'de', 'nl', 'pt']

function normalize(code) {
  if (!code) return null
  const lower = String(code).toLowerCase().split('-')[0]
  return SUPPORTED.includes(lower) ? lower : null
}

const LangContext = createContext(null)

export function LangProvider({ children }) {
  const { user } = useAuth()

  const [lang, setLangState] = useState(() =>
    normalize(localStorage.getItem('lang')) ??
    normalize(navigator.language) ??
    'en'
  )

  useEffect(() => {
    if (user?.language && !localStorage.getItem('lang')) {
      const code = normalize(user.language)
      if (code) setLangState(code)
    }
  }, [user?.language])

  function setLang(code) {
    localStorage.setItem('lang', code)
    setLangState(code)
  }

  function t(key) {
    return translations[lang]?.[key] ?? translations.en?.[key] ?? key
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
