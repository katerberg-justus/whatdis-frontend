import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'

const SUPPORTED = ['en', 'es', 'fr', 'de', 'nl', 'pt']

function normalize(code) {
  if (!code) return null
  const lower = String(code).toLowerCase().split('-')[0]
  return SUPPORTED.includes(lower) ? lower : null
}

export function useDateLocale() {
  const { user } = useAuth()
  const { lang } = useLang()
  const storedLang = normalize(localStorage.getItem('lang'))

  return storedLang ?? normalize(user?.language) ?? navigator.language ?? lang ?? 'en'
}
