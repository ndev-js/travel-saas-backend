import { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import jwt from 'jsonwebtoken'
import { Prisma } from '@/generated/prisma/client'
import { config } from '@/config'
import { AppError, ErrorCode } from '@/utils/app-error'
import { ApiErrorBody } from '@/utils/api-response'

function sendError(res: Response, statusCode: number, code: ErrorCode | string, message: string, details?: unknown) {
  const body: ApiErrorBody = { success: false, error: { code, message, ...(details !== undefined ? { details } : {}) } }
  return res.status(statusCode).json(body)
}

// Mounted last in app.ts. Express 5 forwards rejected promises from async
// route/middleware handlers here automatically (no asyncHandler wrapper
// needed), so this is the single place that turns any thrown error -
// ours or a library's - into the standard response envelope.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): Response {
  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.code, err.message, err.details)
  }

  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }))
    return sendError(res, 422, ErrorCode.VALIDATION_ERROR, 'Validation failed', details)
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[] | undefined)?.join(', ') ?? 'field'
      return sendError(res, 409, ErrorCode.CONFLICT, `A record with this ${target} already exists`)
    }
    if (err.code === 'P2025') {
      return sendError(res, 404, ErrorCode.NOT_FOUND, 'Record not found')
    }
  }

  if (err instanceof jwt.TokenExpiredError) {
    return sendError(res, 401, ErrorCode.TOKEN_EXPIRED, 'Token has expired')
  }
  if (err instanceof jwt.JsonWebTokenError) {
    return sendError(res, 401, ErrorCode.TOKEN_INVALID, 'Invalid token')
  }

  // Unknown/unexpected error: log full detail server-side, but never leak
  // internals (stack traces, DB messages) to the client in production.
  console.error(err)
  const message = config.isDev && err instanceof Error ? err.message : 'Internal server error'
  return sendError(res, 500, ErrorCode.INTERNAL_ERROR, message)
}
