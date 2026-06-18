import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { env } from './config/env'
import { errorMiddleware } from './middlewares/error.middleware'
import authRoutes from './modules/auth/auth.routes'

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

// Error handler (sempre por último)
app.use(errorMiddleware)

export default app
