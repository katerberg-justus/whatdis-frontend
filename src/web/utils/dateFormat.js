export function getPreferredDateLocale(lang) {
  return lang || navigator.language || 'en'
}

export function formatLocalizedDate(value, lang, options = { year: 'numeric', month: 'long', day: 'numeric' }) {
  if (!value) return ''
  const date = typeof value === 'number' ? new Date(value * 1000) : new Date(value)
  return new Intl.DateTimeFormat(getPreferredDateLocale(lang), options).format(date)
}
