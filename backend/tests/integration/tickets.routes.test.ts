import request from 'supertest'
import app from '../../src/app'
import { prisma } from '../../src/config/database'
import { resetDb } from './helpers'

async function registerAndToken(email: string, role?: 'ADMIN' | 'TECHNICIAN' | 'CLIENT') {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: email.split('@')[0], email, password: 'segredo123', role })
  return res.body.data.accessToken as string
}

const bearer = (t: string) => ({ Authorization: `Bearer ${t}` })

let adminT: string
let clientT: string

beforeEach(async () => {
  await resetDb()
  adminT = await registerAndToken('admin@test.com', 'ADMIN')
  clientT = await registerAndToken('cliente@test.com', 'CLIENT')
})

afterAll(async () => {
  await resetDb()
  await prisma.$disconnect()
})

const newTicket = {
  title: 'Computador não liga',
  description: 'O computador da recepção não liga desde ontem',
  priority: 'HIGH',
  category: 'HARDWARE',
}

describe('Tickets routes', () => {
  it('CLIENT cria chamado (201) e vê apenas os seus', async () => {
    const create = await request(app).post('/api/tickets').set(bearer(clientT)).send(newTicket)
    expect(create.status).toBe(201)

    // chamado de outra pessoa (criado pelo admin)
    await request(app).post('/api/tickets').set(bearer(adminT)).send(newTicket)

    const list = await request(app).get('/api/tickets').set(bearer(clientT))
    expect(list.status).toBe(200)
    expect(list.body.total).toBe(1)
  })

  it('ADMIN vê todos os chamados', async () => {
    await request(app).post('/api/tickets').set(bearer(clientT)).send(newTicket)
    await request(app).post('/api/tickets').set(bearer(adminT)).send(newTicket)

    const list = await request(app).get('/api/tickets').set(bearer(adminT))
    expect(list.body.total).toBe(2)
  })

  it('PATCH status como ADMIN grava resolvedAt', async () => {
    const create = await request(app).post('/api/tickets').set(bearer(clientT)).send(newTicket)
    const id = create.body.data.id

    const patch = await request(app).patch(`/api/tickets/${id}`).set(bearer(adminT)).send({ status: 'RESOLVED' })
    expect(patch.status).toBe(200)
    expect(patch.body.data.status).toBe('RESOLVED')
    expect(patch.body.data.resolvedAt).toBeTruthy()
  })

  it('DELETE: CLIENT recebe 403 e ADMIN recebe 200', async () => {
    const create = await request(app).post('/api/tickets').set(bearer(clientT)).send(newTicket)
    const id = create.body.data.id

    const asClient = await request(app).delete(`/api/tickets/${id}`).set(bearer(clientT))
    expect(asClient.status).toBe(403)

    const asAdmin = await request(app).delete(`/api/tickets/${id}`).set(bearer(adminT))
    expect(asAdmin.status).toBe(200)
  })
})
