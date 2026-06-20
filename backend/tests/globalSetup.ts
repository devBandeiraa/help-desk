import { execSync } from 'child_process'

/** Aplica as migrations no banco de teste antes de toda a suíte. */
export default async function globalSetup() {
  const url =
    process.env.DATABASE_URL_TEST ?? 'postgresql://helpdesk:helpdesk123@localhost:5432/helpdesk_test'
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: url },
  })
}
