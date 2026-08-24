import { Router } from 'express'
import {UserController}from './users.controller'
const router = Router()
const userController = new UserController()

router.post('/tenant-user/:tenantId', (req, res) => userController.create(req, res))
export { router as tenantUserRoutes }
