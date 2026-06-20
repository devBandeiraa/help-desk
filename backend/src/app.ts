import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { env } from './config/env'
import { errorMiddleware } from './middlewares/error.middleware'
import { UPLOAD_ROOT } from './middlewares/upload.middleware'
import attachmentsRoutes from './modules/attachments/attachments.routes'
import authRoutes from './modules/auth/auth.routes'
import commentsRoutes from './modules/comments/comments.routes'
import dashboardRoutes from './modules/dashboard/dashboard.routes'
import ticketsRoutes from './modules/tickets/tickets.routes'
import usersRoutes from './modules/users/users.routes'

const app = express()

// Segurança
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors({ origin: env.frontendUrl, credentials: true }))

// Parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Arquivos enviados (estático)
app.use('/uploads', express.static(UPLOAD_ROOT))

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }))

// Rotas (todas sob /api/tickets caem em cascata nos routers abaixo)
app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/tickets', ticketsRoutes)
app.use('/api/tickets', commentsRoutes)
app.use('/api/tickets', attachmentsRoutes)

// Error handler (sempre por último)
app.use(errorMiddleware)

export default app
