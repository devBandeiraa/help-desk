import { Express } from 'express'
import swaggerUi from 'swagger-ui-express'

const openapiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'HelpDesk Pro API',
    version: '1.0.0',
    description:
      'API de gestão de chamados (help desk) com autenticação JWT, RBAC, comentários, anexos e dashboard.',
  },
  servers: [{ url: 'http://localhost:3001', description: 'Local' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: { message: { type: 'string' }, code: { type: 'string' } },
          },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Cadastra um novo usuário',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 6 },
                  role: { type: 'string', enum: ['ADMIN', 'TECHNICIAN', 'CLIENT'] },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Criado com tokens' }, 409: { description: 'E-mail já em uso' } },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Autentica e retorna access + refresh token',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Tokens emitidos' }, 401: { description: 'Credenciais inválidas' } },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Retorna o usuário autenticado',
        responses: { 200: { description: 'Usuário' }, 401: { description: 'Não autenticado' } },
      },
    },
    '/api/tickets': {
      get: {
        tags: ['Tickets'],
        summary: 'Lista chamados (filtros, busca e paginação)',
        parameters: [
          { in: 'query', name: 'status', schema: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'WAITING_CLIENT', 'RESOLVED', 'CLOSED'] } },
          { in: 'query', name: 'priority', schema: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] } },
          { in: 'query', name: 'search', schema: { type: 'string' } },
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
        ],
        responses: { 200: { description: 'Lista paginada' }, 401: { description: 'Não autenticado' } },
      },
      post: {
        tags: ['Tickets'],
        summary: 'Cria um chamado',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'description'],
                properties: {
                  title: { type: 'string', minLength: 5 },
                  description: { type: 'string', minLength: 10 },
                  priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
                  category: { type: 'string', enum: ['INFRASTRUCTURE', 'SOFTWARE', 'HARDWARE', 'NETWORK', 'ACCESS', 'OTHER'] },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Criado' } },
      },
    },
    '/api/tickets/{id}': {
      get: {
        tags: ['Tickets'],
        summary: 'Detalhe do chamado',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Chamado' }, 404: { description: 'Não encontrado' } },
      },
      patch: {
        tags: ['Tickets'],
        summary: 'Atualiza o chamado (status, prioridade, responsável...)',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Atualizado' }, 403: { description: 'Sem permissão' } },
      },
      delete: {
        tags: ['Tickets'],
        summary: 'Exclui o chamado (apenas ADMIN)',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Excluído' }, 403: { description: 'Sem permissão' } },
      },
    },
    '/api/tickets/{ticketId}/comments': {
      post: {
        tags: ['Comments'],
        summary: 'Adiciona um comentário (interno apenas para agentes)',
        parameters: [{ in: 'path', name: 'ticketId', required: true, schema: { type: 'string' } }],
        responses: { 201: { description: 'Comentário criado' } },
      },
    },
    '/api/dashboard': {
      get: {
        tags: ['Dashboard'],
        summary: 'Métricas e dados dos gráficos (escopo por papel)',
        responses: { 200: { description: 'Estatísticas' } },
      },
    },
  },
}

export function setupSwagger(app: Express) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec))
  app.get('/api-docs.json', (_req, res) => res.json(openapiSpec))
}
