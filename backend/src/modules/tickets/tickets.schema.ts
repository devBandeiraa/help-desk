import { z } from 'zod'

const statusEnum = z.enum(['OPEN', 'IN_PROGRESS', 'WAITING_CLIENT', 'RESOLVED', 'CLOSED'])
const priorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
const categoryEnum = z.enum(['INFRASTRUCTURE', 'SOFTWARE', 'HARDWARE', 'NETWORK', 'ACCESS', 'OTHER'])

export const createTicketSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(5000),
  priority: priorityEnum.default('MEDIUM'),
  category: categoryEnum.default('OTHER'),
})

export const updateTicketSchema = z
  .object({
    title: z.string().min(5).max(200).optional(),
    description: z.string().min(10).max(5000).optional(),
    status: statusEnum.optional(),
    priority: priorityEnum.optional(),
    category: categoryEnum.optional(),
    assigneeId: z.string().cuid().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'Nada para atualizar' })

export const listQuerySchema = z.object({
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  category: categoryEnum.optional(),
  assigneeId: z.string().cuid().optional(),
  search: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
})

export const assignSchema = z.object({
  assigneeId: z.string().cuid().nullable(),
})

export type CreateTicketInput = z.infer<typeof createTicketSchema>
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>
export type ListQuery = z.infer<typeof listQuerySchema>
