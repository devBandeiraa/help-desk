import { PrismaClient, Role, TicketStatus, Priority, Category } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

const STATUSES: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'WAITING_CLIENT', 'RESOLVED', 'CLOSED']
const PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const CATEGORIES: Category[] = ['INFRASTRUCTURE', 'SOFTWARE', 'HARDWARE', 'NETWORK', 'ACCESS', 'OTHER']

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** Data aleatória nos últimos `days` dias. */
function dateWithinLastDays(days: number): Date {
  const now = Date.now()
  const past = now - days * 24 * 60 * 60 * 1000
  return new Date(past + Math.random() * (now - past))
}

async function main() {
  console.log('🌱 Limpando tabelas...')
  // Ordem respeita as FKs (filhos antes dos pais).
  await prisma.activityLog.deleteMany()
  await prisma.attachment.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.refreshToken.deleteMany()
  await prisma.ticket.deleteMany()
  await prisma.user.deleteMany()

  console.log('👤 Criando usuários...')
  const adminPass = await bcrypt.hash('Helpdesk@Admin2026', 12)
  const tecPass = await bcrypt.hash('Helpdesk@Tech2026', 12)
  const cliPass = await bcrypt.hash('Helpdesk@Cliente2026', 12)

  const admin = await prisma.user.create({
    data: { name: 'Admin Geral', email: 'admin@helpdesk.com', password: adminPass, role: Role.ADMIN },
  })

  const technicians = await Promise.all(
    [1, 2].map((n) =>
      prisma.user.create({
        data: {
          name: `Técnico ${n}`,
          email: `tecnico${n}@helpdesk.com`,
          password: tecPass,
          role: Role.TECHNICIAN,
        },
      }),
    ),
  )

  const clients = await Promise.all(
    [1, 2, 3, 4, 5].map((n) =>
      prisma.user.create({
        data: {
          name: `Cliente ${n}`,
          email: `cliente${n}@helpdesk.com`,
          password: cliPass,
          role: Role.CLIENT,
        },
      }),
    ),
  )

  console.log('🎫 Criando 30 chamados...')
  for (let i = 0; i < 30; i++) {
    const status = pick(STATUSES)
    const creator = pick(clients)
    const assignee = status === 'OPEN' ? null : pick(technicians)
    const createdAt = dateWithinLastDays(90)
    const resolvedAt =
      status === 'RESOLVED' || status === 'CLOSED'
        ? new Date(createdAt.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000)
        : null
    const closedAt = status === 'CLOSED' ? new Date((resolvedAt ?? createdAt).getTime() + 86400000) : null

    const ticket = await prisma.ticket.create({
      data: {
        title: faker.hacker.phrase().slice(0, 120),
        description: faker.lorem.paragraphs(2),
        status,
        priority: pick(PRIORITIES),
        category: pick(CATEGORIES),
        createdAt,
        resolvedAt,
        closedAt,
        creatorId: creator.id,
        assigneeId: assignee?.id ?? null,
        activities: {
          create: {
            action: 'TICKET_CREATED',
            description: 'Chamado criado',
            userId: creator.id,
            createdAt,
          },
        },
      },
    })

    // 0 a 3 comentários por chamado.
    const nComments = Math.floor(Math.random() * 4)
    for (let c = 0; c < nComments; c++) {
      const author = pick([creator, ...technicians])
      const isInternal = author.role === Role.TECHNICIAN && Math.random() < 0.4
      await prisma.comment.create({
        data: {
          content: faker.lorem.sentences({ min: 1, max: 3 }),
          isInternal,
          ticketId: ticket.id,
          authorId: author.id,
          createdAt: new Date(createdAt.getTime() + (c + 1) * 3600000),
        },
      })
    }
  }

  const counts = {
    users: await prisma.user.count(),
    tickets: await prisma.ticket.count(),
    comments: await prisma.comment.count(),
    activities: await prisma.activityLog.count(),
  }
  console.log('✅ Seed concluído:', counts)
  console.log('\nCredenciais demo:')
  console.log('  Admin:   admin@helpdesk.com / Helpdesk@Admin2026')
  console.log('  Técnico: tecnico1@helpdesk.com / Helpdesk@Tech2026')
  console.log('  Cliente: cliente1@helpdesk.com / Helpdesk@Cliente2026')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
