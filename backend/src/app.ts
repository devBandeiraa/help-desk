import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { env } from './config/env'
import { errorMiddleware } from './middlewares/error.middleware'
import authRoutes from './modules/auth/auth.routes'
import ticketsRoutes from './modules/tickets/tickets.routes'
import usersRoutes from './modules/users/users.routes'

const app = express()

// Segurança
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors({ origin: env.frontendUrl, credentials: true }))

// Parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }))

// Rotas
app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/tickets', ticketsRoutes)

// Error handler (sempre por último)
app.use(errorMiddleware)

export default app
