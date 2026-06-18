import type { Category, Priority, TicketStatus } from '../types'

export const STATUS_LABEL: Record<TicketStatus, string> = {
  OPEN: 'Aberto',
  IN_PROGRESS: 'Em andamento',
  WAITING_CLIENT: 'Aguardando cliente',
  RESOLVED: 'Resolvido',
  CLOSED: 'Fechado',
}

export const STATUS_CLASS: Record<TicketStatus, string> = {
  OPEN: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  WAITING_CLIENT: 'bg-purple-100 text-purple-700',
  RESOLVED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-slate-100 text-slate-600',
}

export const PRIORITY_LABEL: Record<Priority, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
}

export const PRIORITY_CLASS: Record<Priority, string> = {
  LOW: 'bg-slate-100 text-slate-600',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
}

export const CATEGORY_LABEL: Record<Category, string> = {
  INFRASTRUCTURE: 'Infraestrutura',
  SOFTWARE: 'Software',
  HARDWARE: 'Hardware',
  NETWORK: 'Rede',
  ACCESS: 'Acesso',
  OTHER: 'Outro',
}

export const STATUS_OPTIONS = Object.keys(STATUS_LABEL) as TicketStatus[]
export const PRIORITY_OPTIONS = Object.keys(PRIORITY_LABEL) as Priority[]
export const CATEGORY_OPTIONS = Object.keys(CATEGORY_LABEL) as Category[]
