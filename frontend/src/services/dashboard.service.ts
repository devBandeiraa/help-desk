import { api } from './api'

export interface DashboardStats {
  summary: {
    total: number
    open: number
    inProgress: number
    resolved: number
    avgResolutionHours: number
  }
  byStatus: { status: string; count: number; color: string }[]
  byPriority: { priority: string; count: number }[]
  byCategory: { category: string; count: number }[]
  ticketsPerDay: { date: string; created: number; resolved: number }[]
  topTechnicians: { id: string; name: string; resolved: number }[]
  recentActivity: {
    id: string
    action: string
    description: string
    createdAt: string
    user: { id: string; name: string }
    ticket: { id: string; title: string }
  }[]
}

export const dashboardService = {
  async stats(): Promise<DashboardStats> {
    const { data } = await api.get('/api/dashboard')
    return data.data
  },
}
