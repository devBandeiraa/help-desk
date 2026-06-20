import { mockDeep, DeepMockProxy } from 'jest-mock-extended'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prismaMock = mockDeep<PrismaClient>()
jest.mock('../../src/config/database', () => ({ prisma: prismaMock }))

import { authService } from '../../src/modules/auth/auth.service'

const prisma = prismaMock as unknown as DeepMockProxy<PrismaClient>

function fakeUser(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'u1',
    name: 'Fulano',
    email: 'fulano@test.com',
    password: 'hash',
    role: 'CLIENT',
    avatar: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as never
}

describe('authService', () => {
  it('register: e-mail duplicado lança 409', async () => {
    prisma.user.findUnique.mockResolvedValue(fakeUser())
    await expect(
      authService.register({ name: 'X', email: 'fulano@test.com', password: '123456' }),
    ).rejects.toMatchObject({ statusCode: 409 })
  })

  it('register: cria usuário, hasheia a senha e retorna tokens (sem expor a senha)', async () => {
    prisma.user.findUnique.mockResolvedValue(null)
    prisma.user.create.mockResolvedValue(fakeUser())
    prisma.refreshToken.create.mockResolvedValue({} as never)

    const result = await authService.register({ name: 'X', email: 'novo@test.com', password: '123456' })

    expect(result.accessToken).toBeDefined()
    expect(result.refreshToken).toBeDefined()
    expect((result.user as Record<string, unknown>).password).toBeUndefined()
    // a senha persistida deve ser um hash, não o texto puro
    const createArg = prisma.user.create.mock.calls[0][0] as { data: { password: string } }
    expect(createArg.data.password).not.toBe('123456')
  })

  it('login: senha errada lança 401', async () => {
    const hash = await bcrypt.hash('correta', 4)
    prisma.user.findUnique.mockResolvedValue(fakeUser({ password: hash }))
    await expect(
      authService.login({ email: 'fulano@test.com', password: 'errada' }),
    ).rejects.toMatchObject({ statusCode: 401 })
  })

  it('login: usuário inativo lança 401', async () => {
    prisma.user.findUnique.mockResolvedValue(fakeUser({ isActive: false }))
    await expect(
      authService.login({ email: 'fulano@test.com', password: 'qualquer' }),
    ).rejects.toMatchObject({ statusCode: 401 })
  })

  it('refresh: token inexistente no banco lança 401', async () => {
    // token com assinatura válida, mas não persistido
    const reg = await (async () => {
      prisma.user.findUnique.mockResolvedValue(null)
      prisma.user.create.mockResolvedValue(fakeUser())
      prisma.refreshToken.create.mockResolvedValue({} as never)
      return authService.register({ name: 'X', email: 'a@a.com', password: '123456' })
    })()
    prisma.refreshToken.findUnique.mockResolvedValue(null)
    await expect(authService.refresh(reg.refreshToken)).rejects.toMatchObject({ statusCode: 401 })
  })
})
