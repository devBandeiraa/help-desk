import { NextFunction, Request, Response } from 'express'
import { ZodSchema } from 'zod'

/** Valida (e substitui) o req.body conforme um schema Zod. */
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.body = schema.parse(req.body)
    next()
  }
}
