// Executa antes dos módulos serem importados: aponta o Prisma para o banco de teste.
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL =
  process.env.DATABASE_URL_TEST ?? 'postgresql://helpdesk:helpdesk123@localhost:5432/helpdesk_test'
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test_secret'
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'test_refresh_secret'
