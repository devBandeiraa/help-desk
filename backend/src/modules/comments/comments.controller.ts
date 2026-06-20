import { Request, Response } from 'express'
import { ApiError } from '../../utils/ApiError'
import { commentsService } from './comments.service'

function authUser(req: Request) {
  if (!req.user) throw ApiError.unauthorized()
  return { id: req.user.id, role: req.user.role }
}

export const commentsController = {
  async create(req: Request, res: Response) {
    const comment = await commentsService.create(req.params.ticketId, req.body, authUser(req))
    res.status(201).json({ success: true, data: comment })
  },

  async list(req: Request, res: Response) {
    const comments = await commentsService.listForTicket(req.params.ticketId, authUser(req))
    res.json({ success: true, data: comments })
  },
}
