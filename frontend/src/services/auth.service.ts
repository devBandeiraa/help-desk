import type { AuthResult, User } from '../types'
import { api } from './api'

interface LoginPayload {
  email: string
  password: string
}

interface RegisterPayload {
  name: string
  email: string
  password: string
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResult> {
    const { data } = await api.post('/api/auth/login', payload)
    return data.data
  },

  async register(payload: RegisterPayload): Promise<AuthResult> {
    const { data } = await api.post('/api/auth/register', payload)
    return data.data
  },

  async me(): Promise<User> {
    const { data } = await api.get('/api/auth/me')
    return data.data
  },

  async logout(refreshToken: string): Promise<void> {
    await api.post('/api/auth/logout', { refreshToken })
  },
}
