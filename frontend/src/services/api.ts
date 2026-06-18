import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '../store/authStore'

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export const api = axios.create({ baseURL })

// Adiciona o access token em cada request.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Controle de refresh para evitar múltiplas chamadas simultâneas.
let refreshing: Promise<string | null> | null = null

async function runRefresh(): Promise<string | null> {
  const { refreshToken, setSession, clear } = useAuthStore.getState()
  if (!refreshToken) {
    clear()
    return null
  }
  try {
    const { data } = await axios.post(`${baseURL}/api/auth/refresh`, { refreshToken })
    const result = data.data
    setSession(result.user, result.accessToken, result.refreshToken)
    return result.accessToken as string
  } catch {
    clear()
    return null
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    const isAuthRoute = original?.url?.includes('/api/auth/')

    if (error.response?.status === 401 && original && !original._retry && !isAuthRoute) {
      original._retry = true
      refreshing = refreshing ?? runRefresh()
      const newToken = await refreshing
      refreshing = null
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      }
    }
    return Promise.reject(error)
  },
)
