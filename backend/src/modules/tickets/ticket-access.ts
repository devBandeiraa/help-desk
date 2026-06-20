import { Role, Ticket } from '@prisma/client'
import { prisma } from '../../config/database'
import { ApiError } from '../../utils/ApiError'

export interface AuthUser {
  id: string
  role: Role
}

export function isAgent(role: Role): boolean {
  return role === Role.ADMIN || role === Role.TECHNICIAN
}

/** Garante que o usuário pode acessar o chamado; retorna o ticket. */
export async function assertTicketAccess(ticketId: string, user: AuthUser): Promise<Ticket> {
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } })
  if (!ticket) throw ApiError.notFound('Chamado não encontrado')
  if (user.role === Role.CLIENT && ticket.creatorId !== user.id) {
    throw ApiError.forbidden('Você não tem acesso a este chamado')
  }
  return ticket
}
