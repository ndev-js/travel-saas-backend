import { Router } from 'express'
import { TenantController } from './tenants.controller'
const router = Router()
const tenantController = new TenantController()
router.post('/tenant', (req, res) => tenantController.create(req, res))
router.get('/tenants', (req, res) => tenantController.tenants(req, res))
export { router as tenantRoutes }
