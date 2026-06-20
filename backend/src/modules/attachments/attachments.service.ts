import fs from 'fs'
import { prisma } from '../../config/database'
import { ApiError } from '../../utils/ApiError'
import { activity } from '../../utils/activityLogger'
import { assertTicketAccess, AuthUser, isAgent } from '../tickets/ticket-access'

export const attachmentsService = {
  async add(ticketId: string, files: Express.Multer.File[], user: AuthUser) {
    await assertTicketAccess(ticketId, user)
    if (!files?.length) throw ApiError.badRequest('Nenhum arquivo enviado')

    const created = await prisma.$transaction(
      files.map((f) =>
        prisma.attachment.create({
          data: {
            filename: f.filename,
            originalName: f.originalname,
            mimeType: f.mimetype,
            size: f.size,
            path: f.path,
            ticketId,
          },
        }),
      ),
    )

    await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        activities: {
          create: activity(user.id, 'ATTACHMENT_ADDED', `${files.length} anexo(s) adicionado(s)`),
        },
      },
    })

    return created
  },

  async getForDownload(attachmentId: string, user: AuthUser) {
    const attachment = await prisma.attachment.findUnique({ where: { id: attachmentId } })
    if (!attachment) throw ApiError.notFound('Anexo não encontrado')
    await assertTicketAccess(attachment.ticketId, user)
    if (!fs.existsSync(attachment.path)) throw ApiError.notFound('Arquivo não encontrado no servidor')
    return attachment
  },

  async remove(attachmentId: string, user: AuthUser) {
    const attachment = await prisma.attachment.findUnique({ where: { id: attachmentId } })
    if (!attachment) throw ApiError.notFound('Anexo não encontrado')
    const ticket = await assertTicketAccess(attachment.ticketId, user)
    // Autor do chamado ou agente podem remover.
    if (!isAgent(user.role) && ticket.creatorId !== user.id) throw ApiError.forbidden()

    await prisma.attachment.delete({ where: { id: attachmentId } })
    if (fs.existsSync(attachment.path)) fs.unlinkSync(attachment.path)
  },
}
