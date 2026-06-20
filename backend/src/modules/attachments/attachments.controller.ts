import { Request, Response } from 'express'
import { ApiError } from '../../utils/ApiError'
import { attachmentsService } from './attachments.service'

function authUser(req: Request) {
  if (!req.user) throw ApiError.unauthorized()
  return { id: req.user.id, role: req.user.role }
}

export const attachmentsController = {
  async upload(req: Request, res: Response) {
    const files = (req.files as Express.Multer.File[]) ?? []
    const created = await attachmentsService.add(req.params.ticketId, files, authUser(req))
    res.status(201).json({ success: true, data: created })
  },

  async download(req: Request, res: Response) {
    const attachment = await attachmentsService.getForDownload(req.params.id, authUser(req))
    res.download(attachment.path, attachment.originalName)
  },

  async remove(req: Request, res: Response) {
    await attachmentsService.remove(req.params.id, authUser(req))
    res.json({ success: true })
  },
}
