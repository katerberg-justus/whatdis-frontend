import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

const CSRF_METHODS = new Set(['post', 'put', 'patch', 'delete'])

function getCsrfToken(name = 'csrf_access_token') {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

const sharedDefaults = {
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
}

export const authClient = axios.create(sharedDefaults)

export const apiClient = axios.create(sharedDefaults)

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
      try {
        const refreshCsrf = getCsrfToken('csrf_refresh_token')
        await authClient.post('/auth/refresh', null, {
          headers: refreshCsrf ? { 'X-CSRF-TOKEN': refreshCsrf } : {},
        })
        return apiClient(original)
      } catch {
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  },
)
