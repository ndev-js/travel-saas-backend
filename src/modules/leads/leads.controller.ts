import { Request, Response } from 'express'
import { sendSuccess } from '@/utils/api-response'
import { LeadService } from './leads.service'
import { createLeadSchema, leadTenantIdParamSchema } from './leads.validations'

const leadService = new LeadService()

export class LeadController {
  async create(req: Request, res: Response): Promise<Response> {
    const { tenantId } = leadTenantIdParamSchema.parse(req.params)
    const data = createLeadSchema.parse(req.body)
    const result = await leadService.createLead(tenantId, data)
    return sendSuccess(res, result, 201, 'Lead created')
  }

    async getAllTenantLeads(req: Request, res: Response): Promise<Response> {
    const { tenantId } = leadTenantIdParamSchema.parse(req.params)
    const result = await leadService.getAllTenantLeads(tenantId)
    return sendSuccess(res, result, 201, 'Lead created')
  }
}
