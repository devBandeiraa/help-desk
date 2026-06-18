import { PrismaClient } from '@prisma/client'
import { isDev } from './env'

/** Instância única do Prisma Client reutilizada em toda a aplicação. */
export const prisma = new PrismaClient({
  log: isDev ? ['query', 'warn', 'error'] : ['error'],
})
