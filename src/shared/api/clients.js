import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

const CSRF_METHODS = new Set(['post', 'put', 'patch', 'delete'])

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

function getCsrfToken(name = 'csrf_access_token') {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

const sharedDefaults = {
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
}

export const authClient = axios.create({ ...sharedDefaults, baseURL: BASE_URL })

export const apiClient = axios.create({ ...sharedDefaults, baseURL: `${BASE_URL}/api/v1` })

apiClient.interceptors.request.use((config) => {
  if (CSRF_METHODS.has(config.method?.toLowerCase())) {
    const csrf = getCsrfToken()
    if (csrf) config.headers['X-CSRF-TOKEN'] = csrf
  }
  return config
})

apiClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config

    if (err.response?.status === 401 && !original._retry) {
      original._retry = true

      const refreshCsrf = getCsrfToken('csrf_refresh_token')

      if (!refreshCsrf) {
        debugAuthFailure('Missing refresh CSRF before /auth/refresh', err)
        localStorage.removeItem('user')
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
        window.location.href = '/login'
        return Promise.reject(refreshErr)
      }
    }

    return Promise.reject(err)
  },
)
