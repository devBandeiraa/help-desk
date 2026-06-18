# Plano de Implementação — M1: Fundação

**Spec:** [2026-06-18-helpdesk-pro-design.md](../specs/2026-06-18-helpdesk-pro-design.md)
**Detalhes técnicos:** [`prompt-helpdesk-claude-code.md`](../../../prompt-helpdesk-claude-code.md) (Fases 1, 2 e 8)
**Objetivo do marco:** ter o banco de pé via `docker-compose up` e o seed
populando 8 usuários + 30 chamados. Nada de auth/UI ainda.

## Definição de "pronto" (acceptance)

1. `docker-compose up -d postgres` sobe o Postgres com healthcheck verde.
2. `cd backend && npm run db:migrate` aplica a migration inicial sem erro.
3. `cd backend && npm run db:seed` cria 1 admin + 2 técnicos + 5 clientes e 30
   chamados com comentários e activity logs, datas espalhadas em 90 dias.
4. `npx prisma studio` (ou um `SELECT count(*)`) mostra os dados.
5. Tudo commitado seguindo Conventional Commits; `.env` fora do git.

## Passos

### Passo 0 — Git e repositório
- `git init`; configurar `user.name`/`user.email`.
- Criar `.gitignore` na raiz (prompt §8.2) e `backend/.env.example` +
  `frontend/.env.example` (prompt §8.3).
- `mkdir -p backend/uploads && touch backend/uploads/.gitkeep`.
- Commit: `chore: add gitignore and env examples`.
- (Criação do remoto no GitHub fica opcional aqui — pode ser ao fim do M1.)

### Passo 1 — Esqueleto do monorepo
- Criar pastas `backend/` e `frontend/` conforme árvore do prompt §1.1
  (só os diretórios necessários ao M1; o resto entra nos marcos seguintes).
- Commit: `chore: scaffold monorepo structure`.

### Passo 2 — Backend mínimo (TypeScript + Prisma)
- `backend/package.json` com deps: `prisma`, `@prisma/client`, `typescript`,
  `ts-node`, `tsx`, `@types/node`, `bcrypt`/`bcryptjs`, `@faker-js/faker` (seed).
- Scripts: `db:migrate` (`prisma migrate dev`), `db:seed`
  (`prisma db seed` ou `tsx prisma/seed.ts`), `db:studio`.
- `backend/tsconfig.json` (target ES2021, module commonjs, strict).
- `backend/Dockerfile` (node:20-alpine) — pode ser mínimo; usado pelo compose.
- Commit: `chore(backend): setup node + typescript + prisma tooling`.

### Passo 3 — Schema Prisma
- `backend/prisma/schema.prisma` exatamente como o prompt §2.1: enums (Role,
  TicketStatus, Priority, Category) e models (User, Ticket, Comment, Attachment,
  ActivityLog, RefreshToken) com `@@map`.
- Configurar `prisma.seed` no package.json.
- Commit: `feat(db): add prisma schema with all models and enums`.

### Passo 4 — Docker Compose
- `docker-compose.yml` (prompt §1.2) com serviços postgres/backend/frontend.
  Para o M1, focar no serviço `postgres` (healthcheck `pg_isready`).
- `.env` local a partir do `.env.example` com `DATABASE_URL` apontando para o
  Postgres do compose.
- Commit: `chore: add docker-compose with postgres service`.

### Passo 5 — Migration inicial
- Subir o postgres: `docker-compose up -d postgres`.
- `npm run db:migrate -- --name init` → gera `backend/prisma/migrations/`.
- Commit: `feat(db): add initial database migration`.

### Passo 6 — Seed realista
- `backend/prisma/seed.ts` (prompt §2.2): hash de senha com bcrypt; 8 usuários
  com as credenciais demo fixas; 30 chamados com status/prioridade/categoria
  variados; comentários + activity logs; `createdAt` distribuído nos últimos 90
  dias para gráficos do M5.
- `npm run db:seed` e validar contagens.
- Commit: `feat(db): add seed with 8 users and 30 realistic tickets`.

### Passo 7 — Verificação
- Rodar a checklist de "pronto" acima de ponta a ponta.
- (Opcional) criar repo remoto e `git push`.

## Riscos / atenção
- **bcrypt nativo no Alpine** pode exigir build tools; usar `bcryptjs` evita dor
  de cabeça no Docker. Decisão: `bcryptjs` salvo objeção.
- **Senhas demo fixas** (`admin123` etc.) são intencionais — é projeto de
  portfólio com credenciais públicas no README. Não tratar como segredo.
- Manter o seed **idempotente** (limpar tabelas antes de inserir) para poder
  rodar de novo sem duplicar.

## Próximo marco
M2 — Auth (JWT + RBAC + telas de login). Terá seu próprio plano.
