import { mockDeep, DeepMockProxy } from 'jest-mock-extended'
import { PrismaClient } from '@prisma/client'

const prismaMock = mockDeep<PrismaClient>()
jest.mock('../../src/config/database', () => ({ prisma: prismaMock }))

import { ticketsService } from '../../src/modules/tickets/tickets.service'

const prisma = prismaMock as unknown as DeepMockProxy<PrismaClient>

const CLIENT = { id: 'c1', role: 'CLIENT' as const }
const ADMIN = { id: 'a1', role: 'ADMIN' as const }

function ticket(overrides: Record<string, unknown> = {}) {
  return {
    id: 't1',
    title: 'Titulo do chamado',
    description: 'descrição longa o suficiente',
    status: 'OPEN',
    priority: 'MEDIUM',
    category: 'OTHER',
    creatorId: 'c1',
    assigneeId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    resolvedAt: null,
    closedAt: null,
    ...overrides,
  } as never
}

describe('ticketsService', () => {
  it('findAll: CLIENT é escopado ao próprio creatorId', async () => {
    prisma.ticket.findMany.mockResolvedValue([])
    prisma.ticket.count.mockResolvedValue(0)

    await ticketsService.findAll({ page: 1, limit: 10 } as never, CLIENT)

    const arg = prisma.ticket.findMany.mock.calls[0][0] as { where: { creatorId?: string } }
    expect(arg.where.creatorId).toBe('c1')
  })

  it('findAll: ADMIN não recebe filtro por creatorId', async () => {
    prisma.ticket.findMany.mockResolvedValue([])
    prisma.ticket.count.mockResolvedValue(0)

    await ticketsService.findAll({ page: 1, limit: 10 } as never, ADMIN)

    const arg = prisma.ticket.findMany.mock.calls[0][0] as { where: { creatorId?: string } }
    expect(arg.where.creatorId).toBeUndefined()
  })

  it('update: CLIENT não pode alterar status (403)', async () => {
    prisma.ticket.findUnique.mockResolvedValue(ticket())
    await expect(
      ticketsService.update('t1', { status: 'RESOLVED' } as never, CLIENT),
    ).rejects.toMatchObject({ statusCode: 403 })
  })

  it('update: status RESOLVED grava resolvedAt e loga atividade', async () => {
    prisma.ticket.findUnique.mockResolvedValue(ticket())
    prisma.ticket.update.mockResolvedValue(ticket({ status: 'RESOLVED' }))

    await ticketsService.update('t1', { status: 'RESOLVED' } as never, ADMIN)

    const arg = prisma.ticket.update.mock.calls[0][0] as {
      data: { resolvedAt?: Date; status?: string; activities?: unknown }
    }
    expect(arg.data.status).toBe('RESOLVED')
    expect(arg.data.resolvedAt).toBeInstanceOf(Date)
    expect(arg.data.activities).toBeDefined()
  })

  it('remove: não-admin recebe 403', async () => {
    await expect(ticketsService.remove('t1', CLIENT)).rejects.toMatchObject({ statusCode: 403 })
  })
})
