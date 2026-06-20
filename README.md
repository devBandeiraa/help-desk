# HelpDesk Pro 🎫

> Sistema de gestão de chamados (help desk) full-stack — controle de acesso por
> papéis, comentários internos, upload de anexos e dashboard analítico em tempo real.

[![CI](https://github.com/devBandeiraa/help-desk/actions/workflows/ci.yml/badge.svg)](https://github.com/devBandeiraa/help-desk/actions/workflows/ci.yml)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)

---

## ✨ Funcionalidades

- 🔐 **Autenticação JWT** com access token + refresh token (rotação) e refresh automático no front
- 👥 **RBAC** com três papéis: **Admin**, **Técnico** e **Cliente**
- 🎟️ **Gestão de chamados**: CRUD, status, prioridade, categoria, atribuição a técnicos
- 🔎 **Busca, filtros e paginação** na listagem
- 💬 **Comentários** públicos e **internos** (visíveis só à equipe)
- 📎 **Anexos** com validação de tipo/tamanho (upload e download autenticados)
- 🕓 **Histórico de atividades** (activity log) em cada chamado
- 📊 **Dashboard analítico** com métricas e gráficos (Recharts) e escopo por papel
- 🎨 **Interface responsiva** com tema escuro e design próprio (Tailwind)

## 🛠️ Tecnologias

**Backend:** Node.js · Express · TypeScript · Prisma ORM · PostgreSQL · JWT · Zod · Multer · bcrypt
**Frontend:** React · TypeScript · Vite · Tailwind CSS · TanStack Query · Zustand · React Router · Axios · Recharts


## 🏗️ Arquitetura

Monorepo com backend e frontend independentes, comunicando-se por uma API REST.

```
help-desk/
├── backend/                 # API REST (Express + TypeScript)
│   ├── src/
│   │   ├── config/          # env, prisma client
│   │   ├── middlewares/     # auth, rbac, validação, erros, upload
│   │   ├── modules/         # auth, users, tickets, comments, attachments, dashboard
│   │   │   └── <módulo>/    # controller (HTTP) · service (regra) · schema (Zod) · routes
│   │   ├── utils/           # jwt, bcrypt, ApiError, activityLogger
│   │   ├── app.ts           # montagem do Express
│   │   └── server.ts        # bootstrap
│   └── prisma/              # schema, migrations e seed
├── frontend/                # SPA React (Vite + Tailwind)
│   └── src/
│       ├── components/      # ui (Badge, StatCard, Logo) e layout
│       ├── pages/           # auth, dashboard, tickets
│       ├── hooks/           # TanStack Query (useTickets, useDashboard...)
│       ├── services/        # cliente Axios + serviços por domínio
│       ├── store/           # Zustand (auth)
│       └── lib/             # constantes e formatadores
└── docker-compose.yml       # postgres + backend + frontend (opcional)
```

O backend é organizado por **módulos**, cada um com fronteiras claras:
`routes → controller → service → Prisma`. O controller não conhece o Prisma e o
service não conhece `req`/`res`, o que mantém as unidades testáveis e isoladas.

## 🚀 Como rodar localmente

### Pré-requisitos
- Node.js 20+
- PostgreSQL 16+ **ou** Docker

### 1. Banco de dados

**Opção A — Docker (recomendado):**
```bash
docker-compose up -d postgres
```

**Opção B — PostgreSQL nativo:** crie o banco e o usuário:
```sql
CREATE ROLE helpdesk LOGIN PASSWORD 'helpdesk123' CREATEDB;
CREATE DATABASE helpdesk_db OWNER helpdesk;
```

### 2. Backend
```bash
cd backend
cp .env.example .env        # ajuste a DATABASE_URL se necessário
npm install
npm run db:migrate          # aplica as migrations
npm run db:seed             # popula 8 usuários e 30 chamados de demonstração
npm run dev                 # http://localhost:3001
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env        # VITE_API_URL=http://localhost:3001
npm install
npm run dev                 # http://localhost:5173
```

Acesse **http://localhost:5173**.

## 👤 Usuários de demonstração

| Papel   | E-mail                  | Senha                  |
|---------|-------------------------|------------------------|
| Admin   | admin@helpdesk.com      | `Helpdesk@Admin2026`   |
| Técnico | tecnico1@helpdesk.com   | `Helpdesk@Tech2026`    |
| Cliente | cliente1@helpdesk.com   | `Helpdesk@Cliente2026` |

> As credenciais também aparecem na própria tela de login para facilitar o teste.

## 📡 Principais endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/auth/register` | Cadastro |
| `POST` | `/api/auth/login` | Login (retorna tokens) |
| `POST` | `/api/auth/refresh` | Renova o par de tokens |
| `GET`  | `/api/auth/me` | Usuário autenticado |
| `GET`  | `/api/tickets` | Lista (filtros, busca, paginação) |
| `POST` | `/api/tickets` | Cria chamado |
| `GET`  | `/api/tickets/:id` | Detalhe |
| `PATCH`| `/api/tickets/:id` | Atualiza (status, prioridade, responsável) |
| `POST` | `/api/tickets/:id/comments` | Adiciona comentário |
| `POST` | `/api/tickets/:id/attachments` | Envia anexo |
| `GET`  | `/api/dashboard` | Métricas e dados dos gráficos |

Todas as rotas (exceto `register`/`login`) exigem `Authorization: Bearer <token>`.

## 🗺️ Roadmap

- [x] **Fundação** — monorepo, Docker, schema Prisma e seed
- [x] **Autenticação** — JWT + RBAC + telas de login/registro
- [x] **Chamados** — CRUD, filtros, paginação, activity log
- [x] **Colaboração** — comentários (público/interno) e anexos
- [x] **Dashboard** — métricas e gráficos
- [x] **Qualidade** — testes (Jest/Supertest), Swagger/OpenAPI (`/api-docs`) e CI (GitHub Actions)
- [ ] **Deploy** — publicação (Railway/Vercel/Neon)

---

*Projeto desenvolvido como portfólio — Node.js · React · PostgreSQL · TypeScript.*
