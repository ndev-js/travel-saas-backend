import { Request, Response } from 'express'
import { sendSuccess } from '@/utils/api-response'
import { PlatformUserAuthService } from './auth.service'
import { platformAdminSignUpSchema, platformLoginSchema } from './auth.validation'

const authService = new PlatformUserAuthService()

export class PlatformUserAuthController {
  async login(req: Request, res: Response): Promise<Response> {
    const data = platformLoginSchema.parse(req.body)
    const result = await authService.loginPlatformUser(data)
    return sendSuccess(res, result, 200, 'Logged in successfully')
  }
  async signUp(req: Request, res: Response): Promise<Response> {
    const data = platformAdminSignUpSchema.parse(req.body)
    const result = await authService.registerPlatformUser(data)
    return sendSuccess(res, result, 200, ' Registered successfully')
  }
}
