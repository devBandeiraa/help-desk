import { Router } from 'express'
import { authMiddleware } from '../../middlewares/auth.middleware'
import { validate } from '../../middlewares/validate.middleware'
import { asyncHandler } from '../../utils/asyncHandler'
import { commentsController } from './comments.controller'
import { createCommentSchema } from './comments.schema'

const router = Router()

router.use(authMiddleware)
router.get('/:ticketId/comments', asyncHandler(commentsController.list))
router.post('/:ticketId/comments', validate(createCommentSchema), asyncHandler(commentsController.create))

export default router
