import request from 'supertest'
import app from '../../src/app'
import { prisma } from '../../src/config/database'
import { resetDb } from './helpers'

beforeEach(resetDb)
afterAll(async () => {
  await resetDb()
  await prisma.$disconnect()
})

const user = { name: 'Maria', email: 'maria@test.com', password: 'segredo123' }

describe('Auth routes', () => {
  it('POST /api/auth/register → 201 com tokens', async () => {
    const res = await request(app).post('/api/auth/register').send(user)
    expect(res.status).toBe(201)
    expect(res.body.data.accessToken).toBeDefined()
    expect(res.body.data.user.password).toBeUndefined()
  })

  it('POST /api/auth/login → 200; senha errada → 401', async () => {
    await request(app).post('/api/auth/register').send(user)

    const ok = await request(app).post('/api/auth/login').send({ email: user.email, password: user.password })
    expect(ok.status).toBe(200)
    expect(ok.body.data.accessToken).toBeDefined()

    const bad = await request(app).post('/api/auth/login').send({ email: user.email, password: 'errada' })
    expect(bad.status).toBe(401)
  })

  it('GET /api/auth/me exige token (401) e funciona com token (200)', async () => {
    const reg = await request(app).post('/api/auth/register').send(user)
    const token = reg.body.data.accessToken

    const noToken = await request(app).get('/api/auth/me')
    expect(noToken.status).toBe(401)

    const withToken = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`)
    expect(withToken.status).toBe(200)
    expect(withToken.body.data.email).toBe(user.email)
  })

  it('POST /api/auth/refresh → 200 com novo par', async () => {
    const reg = await request(app).post('/api/auth/register').send(user)
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: reg.body.data.refreshToken })
    expect(res.status).toBe(200)
    expect(res.body.data.accessToken).toBeDefined()
  })
})
