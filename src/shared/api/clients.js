import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

const CSRF_METHODS = new Set(['post', 'put', 'patch', 'delete'])
const CSRF_STORAGE_KEYS = {
  csrf_access_token: 'csrf_access_token',
  csrf_refresh_token: 'csrf_refresh_token',
}

function debugAuthFailure(label, err) {
  console.group(label)
  console.log('status:', err?.response?.status)
  console.log('response:', err?.response?.data)
  console.log('request url:', err?.config?.url)
  console.log('request baseURL:', err?.config?.baseURL)
  console.log('headers:', err?.config?.headers)
  console.log('document.cookie:', document.cookie)
  console.groupEnd()
}

export function getCsrfToken(name = 'csrf_access_token') {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  if (match) return decodeURIComponent(match[1])
  const storageKey = CSRF_STORAGE_KEYS[name]
  return storageKey ? localStorage.getItem(storageKey) : null
}

function setCsrfTokens(csrf = {}) {
  if (csrf.access) localStorage.setItem(CSRF_STORAGE_KEYS.csrf_access_token, csrf.access)
  if (csrf.refresh) localStorage.setItem(CSRF_STORAGE_KEYS.csrf_refresh_token, csrf.refresh)
}

export function clearCsrfTokens() {
  localStorage.removeItem(CSRF_STORAGE_KEYS.csrf_access_token)
  localStorage.removeItem(CSRF_STORAGE_KEYS.csrf_refresh_token)
}

export function hasCsrfToken(name = 'csrf_access_token') {
  return Boolean(getCsrfToken(name))
}

const sharedDefaults = {
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
}

export const authClient = axios.create({ ...sharedDefaults, baseURL: BASE_URL })

export const apiClient = axios.create({ ...sharedDefaults, baseURL: `${BASE_URL}/api/v1` })

authClient.interceptors.response.use((res) => {
  setCsrfTokens(res.data?.csrf)
  return res
})

apiClient.interceptors.request.use((config) => {
  if (CSRF_METHODS.has(config.method?.toLowerCase())) {
    const csrf = getCsrfToken()
    if (csrf) {
      config.headers = config.headers ?? {}
      config.headers['X-CSRF-TOKEN'] = csrf
    }
  }
  return config
})

apiClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config

    if (err.response?.status === 401 && !original._retry) {
      if (localStorage.getItem('logged_out')) {
        clearCsrfTokens()
        return Promise.reject(err)
      }

      original._retry = true

      const refreshCsrf = getCsrfToken('csrf_refresh_token')

      if (!refreshCsrf) {
        debugAuthFailure('Missing refresh CSRF before /auth/refresh', err)
        localStorage.removeItem('user')
        clearCsrfTokens()
        window.location.href = '/login'
        return Promise.reject(err)
      }

      try {
        await authClient.post('/auth/refresh', {}, {
          headers: { 'X-CSRF-TOKEN': refreshCsrf },
        })

        return apiClient(original)
      } catch (refreshErr) {
        debugAuthFailure('Refresh failed', refreshErr)
        localStorage.removeItem('user')
        clearCsrfTokens()
        window.location.href = '/login'
        return Promise.reject(refreshErr)
      }
    }

    return Promise.reject(err)
  },
)
