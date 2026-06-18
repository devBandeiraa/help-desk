import { Request, Response } from 'express'
import { prisma } from '../../config/database'

export const usersController = {
  /** Lista técnicos e admins (para o seletor de atribuição). */
  async technicians(_req: Request, res: Response) {
    const technicians = await prisma.user.findMany({
      where: { role: { in: ['TECHNICIAN', 'ADMIN'] }, isActive: true },
      select: { id: true, name: true, email: true, avatar: true, role: true },
      orderBy: { name: 'asc' },
    })
    res.json({ success: true, data: technicians })
  },
}
