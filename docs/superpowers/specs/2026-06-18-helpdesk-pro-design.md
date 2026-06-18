# HelpDesk Pro — Design Spec

**Data:** 2026-06-18
**Status:** Aprovado para implementação por marcos
**Fonte de verdade dos detalhes:** [`prompt-helpdesk-claude-code.md`](../../../prompt-helpdesk-claude-code.md) (raiz do repo)

Este spec fixa as decisões de alto nível e a ordem de construção. Os detalhes
de implementação (schema Prisma completo, contratos de cada endpoint, design
system do frontend, configs de Docker/CI) vivem no `prompt-helpdesk-claude-code.md`
e não são duplicados aqui — quando este spec e o prompt divergirem, **este spec
vence** nas decisões de escopo/ordem; o prompt vence nos detalhes técnicos.

---

## 1. Objetivo e contexto

Construir um **Sistema de Gestão de Chamados (Help Desk) full-stack** de
qualidade de portfólio. O objetivo primário é **demonstrar competência técnica
para recrutadores**: código limpo, arquitetura em camadas, RBAC, testes, CI/CD,
documentação e um frontend visualmente polido e responsivo.

Como o objetivo é portfólio, **amplitude é uma feature** — dashboard analítico,
upload de anexos, testes e CI não são "extras opcionais", são parte do valor.
Por isso não aplicamos YAGNI agressivo ao conjunto de funcionalidades; aplicamos
disciplina à **ordem de construção** para que sempre haja algo rodando.

**Critério de sucesso:** o projeto roda localmente via `docker-compose up`, tem
os 3 papéis funcionando com RBAC correto, CRUD completo de chamados com
comentários e anexos, dashboard com gráficos reais, testes passando, CI verde e
um README apresentável. Deploy público é desejável, porém o último a entrar.

## 2. Stack (decidida)

- **Backend:** Node.js + Express + **TypeScript**, Prisma ORM, **PostgreSQL**
- **Frontend:** React + TypeScript + **Tailwind CSS** (Vite), Zustand, TanStack Query, Axios, Recharts, framer-motion
- **Auth:** JWT com access token (15min) + refresh token (7 dias, persistido no banco)
- **Infra:** Docker + Docker Compose (postgres + backend + frontend)
- **Qualidade:** Jest + Supertest, ESLint/Prettier, Swagger/OpenAPI, GitHub Actions
- **Deploy (final):** Backend em Railway, Frontend em Vercel, banco em Neon

## 3. Arquitetura

Monorepo com dois apps independentes que se comunicam só pela API REST:

```
backend/   → API REST em camadas: routes → controller → service → Prisma
frontend/  → SPA React consumindo a API; estado de auth em Zustand, dados via TanStack Query
postgres   → banco relacional (Docker)
```

**Princípio de isolamento:** o backend é organizado por **módulos** (`auth`,
`users`, `tickets`, `comments`, `attachments`, `dashboard`). Cada módulo tem
controller (HTTP), service (regra de negócio) e schema (validação Zod), com
fronteiras claras: o controller não conhece Prisma, o service não conhece
`req`/`res`. Isso mantém cada unidade testável e compreensível isoladamente.

**Modelo de dados (resumo):** `User`, `Ticket`, `Comment`, `Attachment`,
`ActivityLog`, `RefreshToken`. Schema completo no prompt, Fase 2.

**Fluxo de dados típico (criar ticket):** form React → `useCreateTicket`
(mutation) → `POST /api/tickets` → controller valida (Zod) → service grava via
Prisma + registra `ActivityLog` → resposta → TanStack Query invalida a lista.

**Erros:** um `error.middleware` central traduz `ApiError`, erros do Prisma, do
Zod e do JWT em respostas `{ success: false, error: {...} }`. RBAC via
`rbac.middleware(requireRole(...))` retornando 403.

## 4. Papéis e regras (RBAC)

- **CLIENT** — abre chamados, vê **somente os seus**, comenta (público), anexa.
- **TECHNICIAN** — vê todos, muda status, atribui, comenta (público + **interno**).
- **ADMIN** — tudo do TECHNICIAN + gerencia usuários, deleta chamados, vê ranking de técnicos.

## 5. Marcos de construção (ordem aprovada)

Construir **tudo** o que o prompt define, porém em marcos. Cada marco precisa
terminar **rodando e commitado** antes do próximo. Cada um terá seu próprio
ciclo plano → implementação.

| Marco | Entrega | "Pronto" quando… |
|---|---|---|
| **M1 — Fundação** | Git/repo, `.gitignore`/`.env.example`, monorepo, Docker Compose, Prisma schema + migration + seed | `docker-compose up` sobe o Postgres e o seed popula 8 usuários + 30 chamados |
| **M2 — Auth** | utils JWT/bcrypt, módulo auth (register/login/refresh/logout/me), middlewares auth+RBAC, store Zustand + Axios interceptors, telas de login/registro | Logar com os 3 usuários demo; refresh automático no 401 |
| **M3 — Tickets core** | módulo tickets (CRUD, filtros, paginação, activity log, RBAC por papel), página de lista (tabela+cards) e detalhe, form de novo chamado | CLIENT vê só os seus; ADMIN/TECH veem todos; filtros e paginação funcionam |
| **M4 — Colaboração** | módulos comments (público+interno) e attachments (Multer, validação de tipo/tamanho), UI de comentários e upload drag-and-drop | Comentar, marcar comentário interno, subir e baixar anexo |
| **M5 — Dashboard** | módulo dashboard (stats, séries para gráficos, ranking, atividade recente), página com cards + Recharts | Gráficos refletem os dados reais do seed |
| **M6 — Qualidade** | testes unitários (services) + integração (rotas) com banco de teste, Swagger em todas as rotas, GitHub Actions (lint+test+build) | `npm test` passa; CI verde no GitHub |
| **M7 — Deploy + README** *(opcional/final)* | configs Railway/Vercel/Neon, README com screenshots/badges, proteção da branch main | App público via HTTPS; README apresentável |

## 6. Testes (estratégia)

- **Unitários (Jest):** services de `auth` e `tickets` com Prisma mockado —
  cobrir RBAC (CLIENT não altera status → 403), `resolvedAt` ao resolver,
  logging de atividade, filtros por papel.
- **Integração (Supertest):** fluxos de `auth.routes` e `tickets.routes` contra
  um banco de teste separado (`DATABASE_URL_TEST`), limpando tabelas a cada teste.
- **Frontend:** type-check + build no CI como gate mínimo (sem testes de UI nesta v1).

## 7. Fora de escopo (v1)

Notificações por e-mail/real-time, SLA/automação de fila, multi-empresa
(tenancy), busca full-text avançada, i18n, e testes E2E de frontend. Podem
virar uma v2 — não bloqueiam o portfólio.

## 8. Decisões em aberto / riscos

- **Git ainda não inicializado** neste diretório. M1 começa com `git init` +
  criação do repositório remoto (o prompt traz os comandos na Fase 8).
- **Deploy (M7)** depende de contas em Railway/Vercel/Neon; se não houver, o
  projeto ainda é completo localmente — M7 é o único marco realmente opcional.
- O prompt usa `develop` + feature branches com merges `--no-ff`. Manteremos
  esse fluxo, mas ele pode ser simplificado se você preferir trabalhar só na `main`.
