import { Router } from 'express'
import { authMiddleware } from '../../middlewares/auth.middleware'
import { asyncHandler } from '../../utils/asyncHandler'
import { dashboardController } from './dashboard.controller'

const router = Router()

router.use(authMiddleware)
router.get('/', asyncHandler(dashboardController.stats))

export default router
