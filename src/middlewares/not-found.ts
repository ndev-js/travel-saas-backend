import { NextFunction, Request, Response } from 'express'
import { NotFoundError } from '@/utils/app-error'

// Runs for any request that matched no route. Forwards to errorHandler
// instead of responding directly, so 404s use the same envelope as every
// other error.
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`))
}
