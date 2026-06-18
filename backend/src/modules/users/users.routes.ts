import { Router } from 'express'
import { authMiddleware } from '../../middlewares/auth.middleware'
import { asyncHandler } from '../../utils/asyncHandler'
import { usersController } from './users.controller'

const router = Router()

router.use(authMiddleware)
router.get('/technicians', asyncHandler(usersController.technicians))

export default router
