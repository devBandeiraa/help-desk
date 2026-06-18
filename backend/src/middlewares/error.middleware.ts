import { Prisma } from '@prisma/client'
import { NextFunction, Request, Response } from 'express'
import { JsonWebTokenError } from 'jsonwebtoken'
import { ZodError } from 'zod'
import { isDev } from '../config/env'
import { ApiError } from '../utils/ApiError'

/** Traduz erros conhecidos em respostas JSON padronizadas. */
export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { message: err.message, code: err.code, details: err.details },
    })
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: { message: 'Dados inválidos', code: 'VALIDATION_ERROR', details: err.flatten() },
    })
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const status = err.code === 'P2002' ? 409 : 400
    return res.status(status).json({
      success: false,
      error: { message: 'Erro de banco de dados', code: err.code },
    })
  }

  if (err instanceof JsonWebTokenError) {
    return res.status(401).json({
      success: false,
      error: { message: 'Token inválido', code: 'UNAUTHORIZED' },
    })
  }

  if (isDev) console.error(err)
  return res.status(500).json({
    success: false,
    error: { message: 'Erro interno do servidor', code: 'INTERNAL_ERROR' },
  })
}
