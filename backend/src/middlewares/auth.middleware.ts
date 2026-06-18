import { NextFunction, Request, Response } from 'express'
import { ApiError } from '../utils/ApiError'
import { verifyAccessToken } from '../utils/jwt'

/** Valida o Bearer token e popula req.user. */
export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Token ausente')
  }
  const token = header.slice('Bearer '.length)
  try {
    const payload = verifyAccessToken(token)
    req.user = { id: payload.sub, role: payload.role, email: payload.email }
    next()
  } catch {
    throw ApiError.unauthorized('Token inválido ou expirado')
  }
}
