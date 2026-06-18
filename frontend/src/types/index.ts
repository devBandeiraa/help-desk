export type Role = 'ADMIN' | 'TECHNICIAN' | 'CLIENT'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  avatar?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthResult {
  user: User
  accessToken: string
  refreshToken: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
}
