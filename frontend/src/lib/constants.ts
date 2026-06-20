import type { Category, Priority, TicketStatus } from '../types'

export const STATUS_LABEL: Record<TicketStatus, string> = {
  OPEN: 'Aberto',
  IN_PROGRESS: 'Em andamento',
  WAITING_CLIENT: 'Aguardando cliente',
  RESOLVED: 'Resolvido',
  CLOSED: 'Fechado',
}

export const STATUS_CLASS: Record<TicketStatus, string> = {
  OPEN: 'bg-blue-500/15 text-blue-300 ring-1 ring-inset ring-blue-400/30',
  IN_PROGRESS: 'bg-amber-500/15 text-amber-300 ring-1 ring-inset ring-amber-400/30',
  WAITING_CLIENT: 'bg-purple-500/15 text-purple-300 ring-1 ring-inset ring-purple-400/30',
  RESOLVED: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-400/30',
  CLOSED: 'bg-white/[0.06] text-mist-200 ring-1 ring-inset ring-white/15',
}

export const PRIORITY_LABEL: Record<Priority, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
}

export const PRIORITY_CLASS: Record<Priority, string> = {
  LOW: 'bg-white/[0.06] text-mist-200 ring-1 ring-inset ring-white/15',
  MEDIUM: 'bg-blue-500/15 text-blue-300 ring-1 ring-inset ring-blue-400/30',
  HIGH: 'bg-orange-500/15 text-orange-300 ring-1 ring-inset ring-orange-400/30',
  CRITICAL: 'bg-red-500/15 text-red-300 ring-1 ring-inset ring-red-400/30',
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
