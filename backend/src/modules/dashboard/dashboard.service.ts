import { Prisma, Role } from '@prisma/client'
import { prisma } from '../../config/database'

interface AuthUser {
  id: string
  role: Role
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: '#3b82f6',
  IN_PROGRESS: '#f59e0b',
  WAITING_CLIENT: '#a855f7',
  RESOLVED: '#22c55e',
  CLOSED: '#64748b',
}

const ALL_STATUS = ['OPEN', 'IN_PROGRESS', 'WAITING_CLIENT', 'RESOLVED', 'CLOSED']
const ALL_PRIORITY = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const ALL_CATEGORY = ['INFRASTRUCTURE', 'SOFTWARE', 'HARDWARE', 'NETWORK', 'ACCESS', 'OTHER']

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export const dashboardService = {
  async getStats(user: AuthUser) {
    const isClient = user.role === Role.CLIENT
    const scope: Prisma.TicketWhereInput = isClient ? { creatorId: user.id } : {}

    // Contagens por status
    const byStatusRaw = await prisma.ticket.groupBy({
      by: ['status'],
      where: scope,
      _count: { _all: true },
    })
    const statusCount = (s: string) => byStatusRaw.find((x) => x.status === s)?._count._all ?? 0

    const byPriorityRaw = await prisma.ticket.groupBy({
      by: ['priority'],
      where: scope,
      _count: { _all: true },
    })
    const byCategoryRaw = await prisma.ticket.groupBy({
      by: ['category'],
      where: scope,
      _count: { _all: true },
    })

    const total = byStatusRaw.reduce((acc, x) => acc + x._count._all, 0)

    // Tempo médio de resolução (horas)
    const resolved = await prisma.ticket.findMany({
      where: { ...scope, resolvedAt: { not: null } },
      select: { createdAt: true, resolvedAt: true },
    })
    const avgResolutionHours = resolved.length
      ? Math.round(
          (resolved.reduce((acc, t) => acc + (t.resolvedAt!.getTime() - t.createdAt.getTime()), 0) /
            resolved.length /
            3_600_000) *
            10,
        ) / 10
      : 0

    // Série dos últimos 30 dias
    const since = new Date()
    since.setDate(since.getDate() - 29)
    since.setHours(0, 0, 0, 0)

    const createdRows = await prisma.ticket.findMany({
      where: { ...scope, createdAt: { gte: since } },
      select: { createdAt: true },
    })
    const resolvedRows = await prisma.ticket.findMany({
      where: { ...scope, resolvedAt: { gte: since } },
      select: { resolvedAt: true },
    })

    const perDay = new Map<string, { created: number; resolved: number }>()
    for (let i = 0; i < 30; i++) {
      const d = new Date(since)
      d.setDate(since.getDate() + i)
      perDay.set(dayKey(d), { created: 0, resolved: 0 })
    }
    for (const r of createdRows) {
      const k = dayKey(r.createdAt)
      if (perDay.has(k)) perDay.get(k)!.created++
    }
    for (const r of resolvedRows) {
      const k = dayKey(r.resolvedAt!)
      if (perDay.has(k)) perDay.get(k)!.resolved++
    }
    const ticketsPerDay = [...perDay.entries()].map(([date, v]) => ({ date, ...v }))

    // Ranking de técnicos (apenas dados globais)
    let topTechnicians: Array<{ id: string; name: string; resolved: number }> = []
    if (!isClient) {
      const grouped = await prisma.ticket.groupBy({
        by: ['assigneeId'],
        where: { assigneeId: { not: null }, status: { in: ['RESOLVED', 'CLOSED'] } },
        _count: { _all: true },
      })
      const techs = await prisma.user.findMany({
        where: { id: { in: grouped.map((g) => g.assigneeId!).filter(Boolean) } },
        select: { id: true, name: true },
      })
      topTechnicians = grouped
        .map((g) => ({
          id: g.assigneeId!,
          name: techs.find((t) => t.id === g.assigneeId)?.name ?? '—',
          resolved: g._count._all,
        }))
        .sort((a, b) => b.resolved - a.resolved)
        .slice(0, 5)
    }

    // Atividade recente
    const recentActivity = await prisma.activityLog.findMany({
      where: isClient ? { ticket: { creatorId: user.id } } : {},
      include: {
        user: { select: { id: true, name: true } },
        ticket: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    return {
      summary: {
        total,
        open: statusCount('OPEN'),
        inProgress: statusCount('IN_PROGRESS'),
        resolved: statusCount('RESOLVED'),
        avgResolutionHours,
      },
      byStatus: ALL_STATUS.map((s) => ({
        status: s,
        count: statusCount(s),
        color: STATUS_COLORS[s],
      })),
      byPriority: ALL_PRIORITY.map((p) => ({
        priority: p,
        count: byPriorityRaw.find((x) => x.priority === p)?._count._all ?? 0,
      })),
      byCategory: ALL_CATEGORY.map((c) => ({
        category: c,
        count: byCategoryRaw.find((x) => x.category === c)?._count._all ?? 0,
      })),
      ticketsPerDay,
      topTechnicians,
      recentActivity,
    }
  },
}
