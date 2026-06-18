import { NextFunction, Request, RequestHandler, Response } from 'express'

/** Encaminha rejeições de handlers async para o error middleware (Express 4). */
export function asyncHandler(fn: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
