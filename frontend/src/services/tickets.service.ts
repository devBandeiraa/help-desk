import type { Paginated, Ticket, TicketFilters } from '../types'
import { api } from './api'

interface CreateTicketPayload {
  title: string
  description: string
  priority: string
  category: string
}

export const ticketsService = {
  async list(filters: TicketFilters): Promise<Paginated<Ticket>> {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== ''),
    )
    const { data } = await api.get('/api/tickets', { params })
    return data
  },

  async get(id: string): Promise<Ticket> {
    const { data } = await api.get(`/api/tickets/${id}`)
    return data.data
  },

  async create(payload: CreateTicketPayload): Promise<Ticket> {
    const { data } = await api.post('/api/tickets', payload)
    return data.data
  },

  async update(id: string, payload: Partial<Ticket> & { assigneeId?: string | null }): Promise<Ticket> {
    const { data } = await api.patch(`/api/tickets/${id}`, payload)
    return data.data
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/api/tickets/${id}`)
  },
}

export interface Technician {
  id: string
  name: string
  email: string
  role: string
}

export const usersService = {
  async technicians(): Promise<Technician[]> {
    const { data } = await api.get('/api/users/technicians')
    return data.data
  },
}
