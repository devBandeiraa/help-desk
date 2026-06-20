import { prisma } from '../../config/database'
import { activity } from '../../utils/activityLogger'
import { assertTicketAccess, AuthUser, isAgent } from '../tickets/ticket-access'
import type { CreateCommentInput } from './comments.schema'

const authorSelect = { id: true, name: true, avatar: true, role: true }

export const commentsService = {
  async create(ticketId: string, input: CreateCommentInput, user: AuthUser) {
    await assertTicketAccess(ticketId, user)
    // Apenas agentes podem criar comentário interno.
    const isInternal = input.isInternal && isAgent(user.role)

    const comment = await prisma.comment.create({
      data: {
        content: input.content,
        isInternal: !!isInternal,
        ticketId,
        authorId: user.id,
      },
      include: { author: { select: authorSelect } },
    })

    await prisma.ticket.update({
      where: { id: ticketId },
      data: { activities: { create: activity(user.id, 'COMMENT_ADDED', 'Comentário adicionado') } },
    })

    return comment
  },

  async listForTicket(ticketId: string, user: AuthUser) {
    await assertTicketAccess(ticketId, user)
    return prisma.comment.findMany({
      where: {
        ticketId,
        // CLIENT não vê comentários internos.
        ...(!isAgent(user.role) && { isInternal: false }),
      },
      include: { author: { select: authorSelect } },
      orderBy: { createdAt: 'asc' },
    })
  },
}
