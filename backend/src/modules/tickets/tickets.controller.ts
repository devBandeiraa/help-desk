import { Request, Response } from 'express'
import { ApiError } from '../../utils/ApiError'
import { listQuerySchema } from './tickets.schema'
import { ticketsService } from './tickets.service'

function authUser(req: Request) {
  if (!req.user) throw ApiError.unauthorized()
  return { id: req.user.id, role: req.user.role }
}

export const ticketsController = {
  async create(req: Request, res: Response) {
    const ticket = await ticketsService.create(req.body, authUser(req).id)
    res.status(201).json({ success: true, data: ticket })
  },

  async list(req: Request, res: Response) {
    const query = listQuerySchema.parse(req.query)
    const result = await ticketsService.findAll(query, authUser(req))
    res.json({ success: true, ...result })
  },

  async detail(req: Request, res: Response) {
    const ticket = await ticketsService.findById(req.params.id, authUser(req))
    res.json({ success: true, data: ticket })
  },

  async update(req: Request, res: Response) {
    const ticket = await ticketsService.update(req.params.id, req.body, authUser(req))
    res.json({ success: true, data: ticket })
  },

  async assign(req: Request, res: Response) {
    const ticket = await ticketsService.assign(req.params.id, req.body.assigneeId, authUser(req))
    res.json({ success: true, data: ticket })
  },

  async remove(req: Request, res: Response) {
    await ticketsService.remove(req.params.id, authUser(req))
    res.json({ success: true })
  },
}
