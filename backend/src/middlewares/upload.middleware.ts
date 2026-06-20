import fs from 'fs'
import multer from 'multer'
import path from 'path'
import { ApiError } from '../utils/ApiError'

// Em serverless (Vercel) o único diretório gravável é /tmp (efêmero).
const defaultUploadDir = process.env.VERCEL
  ? '/tmp/uploads'
  : path.join(__dirname, '..', '..', 'uploads')
const UPLOAD_ROOT = path.resolve(process.env.UPLOAD_DIR ?? defaultUploadDir)

const ALLOWED = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

const storage = multer.diskStorage({
  destination(req, _file, cb) {
    const dir = path.join(UPLOAD_ROOT, 'tickets', req.params.ticketId)
    fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename(_req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`)
  },
})

export const uploadAttachments = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
  fileFilter(_req, file, cb) {
    if (ALLOWED.has(file.mimetype)) cb(null, true)
    else cb(ApiError.badRequest(`Tipo de arquivo não permitido: ${file.mimetype}`))
  },
}).array('files', 5)

export { UPLOAD_ROOT }
