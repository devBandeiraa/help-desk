import { Prisma } from '@prisma/client'

/** Monta um registro de ActivityLog para criação dentro de uma operação Prisma. */
export function activity(
  userId: string,
  action: string,
  description: string,
  change?: { oldValue?: string | null; newValue?: string | null },
): Prisma.ActivityLogCreateWithoutTicketInput {
  return {
    action,
    description,
    oldValue: change?.oldValue ?? null,
    newValue: change?.newValue ?? null,
    user: { connect: { id: userId } },
  }
}
