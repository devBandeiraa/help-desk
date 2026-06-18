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

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_CLIENT' | 'RESOLVED' | 'CLOSED'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type Category = 'INFRASTRUCTURE' | 'SOFTWARE' | 'HARDWARE' | 'NETWORK' | 'ACCESS' | 'OTHER'

export interface UserRef {
  id: string
  name: string
  email?: string
  avatar?: string | null
  role?: Role
}

export interface TicketComment {
  id: string
  content: string
  isInternal: boolean
  createdAt: string
  author: UserRef
}

export interface TicketActivity {
  id: string
  action: string
  description: string
  oldValue?: string | null
  newValue?: string | null
  createdAt: string
  user: UserRef
}

export interface Ticket {
  id: string
  title: string
  description: string
  status: TicketStatus
  priority: Priority
  category: Category
  createdAt: string
  updatedAt: string
  resolvedAt?: string | null
  closedAt?: string | null
  creator: UserRef
  assignee?: UserRef | null
  comments?: TicketComment[]
  activities?: TicketActivity[]
}

export interface Paginated<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
}

export interface TicketFilters {
  status?: TicketStatus
  priority?: Priority
  category?: Category
  assigneeId?: string
  search?: string
  page?: number
  limit?: number
}
