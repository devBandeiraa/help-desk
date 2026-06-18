import { Role } from '@prisma/client'
import { NextFunction, Request, Response } from 'express'
import { ApiError } from '../utils/ApiError'

/** Garante que req.user tenha um dos papéis permitidos. */
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw ApiError.unauthorized()
    if (!roles.includes(req.user.role)) throw ApiError.forbidden()
    next()
  }
}
