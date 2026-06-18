import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Ticket, TicketFilters } from '../types'
import { ticketsService, usersService } from '../services/tickets.service'

export function useTickets(filters: TicketFilters) {
  return useQuery({
    queryKey: ['tickets', filters],
    queryFn: () => ticketsService.list(filters),
  })
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketsService.get(id),
    enabled: !!id,
  })
}

export function useTechnicians() {
  return useQuery({ queryKey: ['technicians'], queryFn: usersService.technicians })
}

export function useUpdateTicket(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<Ticket> & { assigneeId?: string | null }) =>
      ticketsService.update(id, payload),
    onSuccess: (data) => {
      qc.setQueryData(['ticket', id], data)
      qc.invalidateQueries({ queryKey: ['tickets'] })
    },
  })
}
