import { Router } from 'express'
import { authMiddleware } from '../../middlewares/auth.middleware'
import { validate } from '../../middlewares/validate.middleware'
import { asyncHandler } from '../../utils/asyncHandler'
import { authController } from './auth.controller'
import { loginSchema, refreshSchema, registerSchema } from './auth.schema'

const router = Router()

router.post('/register', validate(registerSchema), asyncHandler(authController.register))
router.post('/login', validate(loginSchema), asyncHandler(authController.login))
router.post('/refresh', validate(refreshSchema), asyncHandler(authController.refresh))
router.post('/logout', validate(refreshSchema), asyncHandler(authController.logout))
router.get('/me', authMiddleware, asyncHandler(authController.me))

export default router
