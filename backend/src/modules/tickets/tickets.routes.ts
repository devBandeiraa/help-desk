import { Router } from 'express'
import { authMiddleware } from '../../middlewares/auth.middleware'
import { validate } from '../../middlewares/validate.middleware'
import { asyncHandler } from '../../utils/asyncHandler'
import { ticketsController } from './tickets.controller'
import { assignSchema, createTicketSchema, updateTicketSchema } from './tickets.schema'

const router = Router()

router.use(authMiddleware)

router.get('/', asyncHandler(ticketsController.list))
router.post('/', validate(createTicketSchema), asyncHandler(ticketsController.create))
router.get('/:id', asyncHandler(ticketsController.detail))
router.patch('/:id', validate(updateTicketSchema), asyncHandler(ticketsController.update))
router.patch('/:id/assign', validate(assignSchema), asyncHandler(ticketsController.assign))
router.delete('/:id', asyncHandler(ticketsController.remove))

export default router
