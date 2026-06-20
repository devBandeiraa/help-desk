import { prisma } from '../../src/config/database'

/** Limpa todas as tabelas respeitando as FKs. */
export async function resetDb() {
  await prisma.activityLog.deleteMany()
  await prisma.attachment.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.refreshToken.deleteMany()
  await prisma.ticket.deleteMany()
  await prisma.user.deleteMany()
}
