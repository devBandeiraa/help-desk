import { Role, User } from '@prisma/client'
import { prisma } from '../../config/database'
import { env } from '../../config/env'
import { ApiError } from '../../utils/ApiError'
import { comparePassword, hashPassword } from '../../utils/bcrypt'
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../utils/jwt'
import type { LoginInput, RegisterInput } from './auth.schema'

type SafeUser = Omit<User, 'password'>

function stripPassword(user: User): SafeUser {
  const { password: _omit, ...rest } = user
  return rest
}

/** Duração do refresh token em ms, derivada de env (suporta "7d"/"24h"/"3600s"). */
function refreshTtlMs(): number {
  const raw = env.jwt.refreshExpiresIn
  const match = /^(\d+)([smhd])$/.exec(raw)
  if (!match) return 7 * 24 * 60 * 60 * 1000
  const value = Number(match[1])
  const unit = match[2]
  const factor = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit]!
  return value * factor
}

async function issueTokens(user: User) {
  const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email })
  const refreshToken = signRefreshToken(user.id)
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + refreshTtlMs()),
    },
  })
  return { accessToken, refreshToken }
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } })
    if (existing) throw ApiError.conflict('E-mail já cadastrado')

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: await hashPassword(input.password),
        role: (input.role as Role) ?? Role.CLIENT,
      },
    })
    const tokens = await issueTokens(user)
    return { user: stripPassword(user), ...tokens }
  },

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } })
    if (!user || !user.isActive) throw ApiError.unauthorized('Credenciais inválidas')

    const ok = await comparePassword(input.password, user.password)
    if (!ok) throw ApiError.unauthorized('Credenciais inválidas')

    const tokens = await issueTokens(user)
    return { user: stripPassword(user), ...tokens }
  },

  /** Rotação: invalida o refresh usado e emite um novo par. */
  async refresh(refreshToken: string) {
    let payload: { sub: string }
    try {
      payload = verifyRefreshToken(refreshToken)
    } catch {
      throw ApiError.unauthorized('Refresh token inválido')
    }

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } })
    if (!stored || stored.expiresAt < new Date()) {
      throw ApiError.unauthorized('Refresh token expirado ou revogado')
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user || !user.isActive) throw ApiError.unauthorized('Usuário inválido')

    await prisma.refreshToken.delete({ where: { token: refreshToken } })
    const tokens = await issueTokens(user)
    return { user: stripPassword(user), ...tokens }
  },

  async logout(refreshToken: string) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } })
  },

  async me(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw ApiError.notFound('Usuário não encontrado')
    return stripPassword(user)
  },
}
