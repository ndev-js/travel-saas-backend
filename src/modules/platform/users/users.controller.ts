import { Request, Response } from 'express'
import { sendSuccess } from '@/utils/api-response'
import {UserService  } from './users.service'
import { tenantIdParamSchema, tenantUserSchema } from './users.validations'

const userService = new UserService()

export class UserController {
  async create(req: Request, res: Response): Promise<Response> {
    const { tenantId } = tenantIdParamSchema.parse(req.params)
    const data = tenantUserSchema.parse(req.body)
    const result = await userService.createTenantUser(tenantId,data)
    return sendSuccess(res, result, 200, 'Logged in successfully')
  }
 
}
