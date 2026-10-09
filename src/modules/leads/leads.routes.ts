import { Router } from 'express'
import { LeadController } from './leads.controller'

const router = Router()
const leadController = new LeadController()

router.post('/lead/:tenantId', (req, res) => leadController.create(req, res))
router.post('/lead/:tenantId', (req, res) => leadController.getAllTenantLeads(req, res))

export { router as leadRoutes }
