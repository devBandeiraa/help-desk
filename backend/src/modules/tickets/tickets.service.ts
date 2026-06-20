import { Prisma, Role, TicketStatus } from '@prisma/client'
import { prisma } from '../../config/database'
import { ApiError } from '../../utils/ApiError'
import { activity } from '../../utils/activityLogger'
import type { CreateTicketInput, ListQuery, UpdateTicketInput } from './tickets.schema'

interface AuthUser {
  id: string
  role: Role
}

const listInclude = {
  creator: { select: { id: true, name: true, email: true, avatar: true } },
  assignee: { select: { id: true, name: true, email: true, avatar: true } },
} satisfies Prisma.TicketInclude

const detailInclude = {
  ...listInclude,
  comments: {
    orderBy: { createdAt: 'asc' },
    include: { author: { select: { id: true, name: true, avatar: true, role: true } } },
  },
  attachments: true,
  activities: {
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { id: true, name: true, avatar: true } } },
  },
} satisfies Prisma.TicketInclude

function isAgent(role: Role) {
  return role === Role.ADMIN || role === Role.TECHNICIAN
}

export const ticketsService = {
  async create(input: CreateTicketInput, userId: string) {
    return prisma.ticket.create({
      data: {
        ...input,
        creatorId: userId,
        activities: { create: activity(userId, 'TICKET_CREATED', 'Chamado criado') },
      },
      include: listInclude,
    })
  },

  async findAll(query: ListQuery, user: AuthUser) {
    const { status, priority, category, assigneeId, search, page, limit } = query

    const where: Prisma.TicketWhereInput = {
      ...(status && { status }),
      ...(priority && { priority }),
      ...(category && { category }),
      ...(assigneeId && { assigneeId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      // CLIENT só enxerga os próprios chamados.
      ...(user.role === Role.CLIENT && { creatorId: user.id }),
    }

    const [data, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: listInclude,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.ticket.count({ where }),
    ])

    return { data, total, page, totalPages: Math.ceil(total / limit) || 1 }
  },

  async findById(id: string, user: AuthUser) {
    const isClient = user.role === Role.CLIENT
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        ...detailInclude,
        comments: {
          ...detailInclude.comments,
          // CLIENT não vê comentários internos.
          ...(isClient && { where: { isInternal: false } }),
        },
      },
    })
    if (!ticket) throw ApiError.notFound('Chamado não encontrado')
    if (isClient && ticket.creatorId !== user.id) {
      throw ApiError.forbidden('Você não tem acesso a este chamado')
    }
    return ticket
  },

  async update(id: string, input: UpdateTicketInput, user: AuthUser) {
    const ticket = await prisma.ticket.findUnique({ where: { id } })
    if (!ticket) throw ApiError.notFound('Chamado não encontrado')

    const owner = ticket.creatorId === user.id
    if (user.role === Role.CLIENT && !owner) {
      throw ApiError.forbidden('Você não tem acesso a este chamado')
    }
    // CLIENT só pode editar título/descrição do próprio chamado.
    const restricted = input.status || input.priority || input.assigneeId !== undefined
    if (user.role === Role.CLIENT && restricted) {
      throw ApiError.forbidden('Sem permissão para alterar status, prioridade ou responsável')
    }

    const data: Prisma.TicketUpdateInput = {}
    const logs: Prisma.ActivityLogCreateWithoutTicketInput[] = []

    if (input.title && input.title !== ticket.title) data.title = input.title
    if (input.description && input.description !== ticket.description) data.description = input.description
    if (input.category && input.category !== ticket.category) {
      data.category = input.category
      logs.push(activity(user.id, 'CATEGORY_CHANGED', 'Categoria alterada', { oldValue: ticket.category, newValue: input.category }))
    }
    if (input.priority && input.priority !== ticket.priority) {
      data.priority = input.priority
      logs.push(activity(user.id, 'PRIORITY_CHANGED', 'Prioridade alterada', { oldValue: ticket.priority, newValue: input.priority }))
    }
    if (input.assigneeId !== undefined && input.assigneeId !== ticket.assigneeId) {
      data.assignee = input.assigneeId ? { connect: { id: input.assigneeId } } : { disconnect: true }
      logs.push(activity(user.id, 'ASSIGNED', 'Responsável alterado', { oldValue: ticket.assigneeId, newValue: input.assigneeId }))
    }
    if (input.status && input.status !== ticket.status) {
      data.status = input.status
      logs.push(activity(user.id, 'STATUS_CHANGED', 'Status alterado', { oldValue: ticket.status, newValue: input.status }))
      if (input.status === TicketStatus.RESOLVED) data.resolvedAt = new Date()
      if (input.status === TicketStatus.CLOSED) data.closedAt = new Date()
    }

    if (logs.length) data.activities = { create: logs }

    return prisma.ticket.update({ where: { id }, data, include: detailInclude })
  },

  async assign(id: string, assigneeId: string | null, user: AuthUser) {
    if (!isAgent(user.role)) throw ApiError.forbidden()
    const ticket = await prisma.ticket.findUnique({ where: { id } })
    if (!ticket) throw ApiError.notFound('Chamado não encontrado')

    return prisma.ticket.update({
      where: { id },
      data: {
        assignee: assigneeId ? { connect: { id: assigneeId } } : { disconnect: true },
        activities: {
          create: activity(user.id, 'ASSIGNED', 'Responsável alterado', {
            oldValue: ticket.assigneeId,
            newValue: assigneeId,
          }),
        },
      },
      include: detailInclude,
    })
  },

  async remove(id: string, user: AuthUser) {
    if (user.role !== Role.ADMIN) throw ApiError.forbidden('Apenas administradores podem excluir')
    const ticket = await prisma.ticket.findUnique({ where: { id } })
    if (!ticket) throw ApiError.notFound('Chamado não encontrado')
    await prisma.ticket.delete({ where: { id } })
  },
}
