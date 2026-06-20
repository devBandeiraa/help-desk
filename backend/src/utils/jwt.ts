import { randomUUID } from 'crypto'
import jwt, { SignOptions } from 'jsonwebtoken'
import { Role } from '@prisma/client'
import { env } from '../config/env'

export interface AccessPayload {
  sub: string
  role: Role
  email: string
}

export function signAccessToken(payload: AccessPayload): string {
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
  } as SignOptions)
}

export function signRefreshToken(userId: string): string {
  // jti aleatório garante que cada refresh token seja único (evita colisão quando
  // dois são emitidos para o mesmo usuário no mesmo segundo).
  return jwt.sign({ sub: userId, jti: randomUUID() }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  } as SignOptions)
}

export function verifyAccessToken(token: string): AccessPayload {
  return jwt.verify(token, env.jwt.accessSecret) as AccessPayload
}

export function verifyRefreshToken(token: string): { sub: string } {
  return jwt.verify(token, env.jwt.refreshSecret) as { sub: string }
}
