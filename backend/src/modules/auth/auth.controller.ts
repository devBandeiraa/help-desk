import { Request, Response } from 'express'
import { ApiError } from '../../utils/ApiError'
import { authService } from './auth.service'

export const authController = {
  async register(req: Request, res: Response) {
    const result = await authService.register(req.body)
    res.status(201).json({ success: true, data: result })
  },

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body)
    res.json({ success: true, data: result })
  },

  async refresh(req: Request, res: Response) {
    const result = await authService.refresh(req.body.refreshToken)
    res.json({ success: true, data: result })
  },

  async logout(req: Request, res: Response) {
    await authService.logout(req.body.refreshToken)
    res.json({ success: true })
  },

  async me(req: Request, res: Response) {
    if (!req.user) throw ApiError.unauthorized()
    const user = await authService.me(req.user.id)
    res.json({ success: true, data: user })
  },
}
