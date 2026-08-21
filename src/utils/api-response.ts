import { Response } from 'express'

// Single envelope shape for every JSON response, success or failure, so the
// frontend can branch on `success` instead of guessing per-endpoint.
export interface ApiSuccessBody<T> {
  success: true
  data: T
  message?: string
}

export interface ApiErrorBody {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export function sendSuccess<T>(res: Response, data: T, statusCode = 200, message?: string): Response {
  const body: ApiSuccessBody<T> = { success: true, data, ...(message ? { message } : {}) }
  return res.status(statusCode).json(body)
}
