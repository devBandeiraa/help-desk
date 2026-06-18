/** Centraliza e valida as variáveis de ambiente usadas pela aplicação. */
function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback
  if (value === undefined) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`)
  }
  return value
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3001),
  databaseUrl: required('DATABASE_URL', 'postgresql://helpdesk:helpdesk123@localhost:5432/helpdesk_db'),
  jwt: {
    accessSecret: required('JWT_SECRET', 'dev_only_change_me'),
    refreshSecret: required('JWT_REFRESH_SECRET', 'dev_only_change_me_too'),
    accessExpiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
}

export const isDev = env.nodeEnv === 'development'
