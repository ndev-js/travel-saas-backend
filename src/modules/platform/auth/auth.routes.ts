import { Router } from 'express'
import { PlatformUserAuthController } from './auth.controller'

const router = Router()
const authController = new PlatformUserAuthController()

router.post('/login', (req, res) => authController.login(req, res))
router.post('/signup', (req, res) => authController.signUp(req, res))

export { router as platformAuthRouter }
