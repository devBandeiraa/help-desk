import { Router } from 'express'
import { authMiddleware } from '../../middlewares/auth.middleware'
import { uploadAttachments } from '../../middlewares/upload.middleware'
import { asyncHandler } from '../../utils/asyncHandler'
import { attachmentsController } from './attachments.controller'

const router = Router()

router.use(authMiddleware)
router.post('/:ticketId/attachments', uploadAttachments, asyncHandler(attachmentsController.upload))
router.get('/attachments/:id/download', asyncHandler(attachmentsController.download))
router.delete('/attachments/:id', asyncHandler(attachmentsController.remove))

export default router
