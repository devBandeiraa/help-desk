import { Request, Response } from 'express'
import { ApiError } from '../../utils/ApiError'
import { dashboardService } from './dashboard.service'

export const dashboardController = {
  async stats(req: Request, res: Response) {
    if (!req.user) throw ApiError.unauthorized()
    const data = await dashboardService.getStats({ id: req.user.id, role: req.user.role })
    res.json({ success: true, data })
  },
}
