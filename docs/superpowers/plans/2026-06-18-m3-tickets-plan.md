# Plano de Implementação — M3: Tickets core

**Spec:** [2026-06-18-helpdesk-pro-design.md](../specs/2026-06-18-helpdesk-pro-design.md)
**Detalhes técnicos:** [`prompt-helpdesk-claude-code.md`](../../../prompt-helpdesk-claude-code.md) (Fases 3.3, 3.7 e 4.4)
**Objetivo:** CRUD completo de chamados com filtros, paginação, RBAC por papel e
activity log; UI de lista (tabela+cards), detalhe e criação.

> Comentários e anexos são M4 — no detalhe ficam como placeholder por enquanto.

## Definição de "pronto" (acceptance)

1. CLIENT cria chamado e vê **apenas os seus**; ADMIN/TECHNICIAN veem todos.
2. Lista com filtros (status, priority, category, assigneeId, search) e paginação
   `{ data, total, page, totalPages }`.
3. Detalhe retorna ticket com creator, assignee, comments, activities.
4. Update loga cada mudança no ActivityLog; status→RESOLVED grava `resolvedAt`,
   status→CLOSED grava `closedAt`. CLIENT não altera status (403).
5. `assign` atribui técnico e loga atividade. `delete` só ADMIN.
6. Frontend: lista, detalhe e criação funcionando contra a API.

## Backend (`src/modules/tickets/`)

- `tickets.schema.ts` — Zod: createTicketSchema, updateTicketSchema, listQuerySchema.
- `tickets.service.ts`:
  - `create(data, userId)` → cria + activity "Chamado criado".
  - `findAll(filters, page, limit, user)` → where por papel (CLIENT só os seus),
    filtros e busca; retorna paginado.
  - `findById(id, user)` → inclui relações; CLIENT só acessa o próprio (404/403).
  - `update(id, data, user)` → RBAC (CLIENT não muda status/assignee), activity
    log por campo, resolvedAt/closedAt.
  - `assign(id, assigneeId, user)` → TECH/ADMIN; activity log.
  - `remove(id, user)` → só ADMIN.
- `tickets.controller.ts` + `tickets.routes.ts` (todas as rotas autenticadas).
- `utils/activityLogger.ts` — helper para registrar mudanças.
- Montar em `app.ts`: `app.use('/api/tickets', ticketsRoutes)`.
- Endpoint auxiliar `GET /api/users/technicians` (lista técnicos p/ atribuição) —
  módulo `users` mínimo agora, expandido no futuro.

## Frontend

- `components/ui/Badge.tsx` — status/priority com cores semânticas (spec §4.1).
- `components/layout/AppLayout.tsx` — Sidebar + Topbar simples (reaproveitado nos
  próximos marcos); rotas protegidas passam a usar o layout.
- `services/tickets.service.ts` + hooks `useTickets`, `useTicket` (TanStack Query).
- `pages/tickets/TicketsPage.tsx` — filtros (busca com debounce), tabela,
  paginação, botão "Novo Chamado".
- `pages/tickets/TicketDetailPage.tsx` — dados + edição de status/priority/assignee
  (conforme papel); seções de comentários/anexos como placeholder (M4).
- `pages/tickets/NewTicketPage.tsx` — form de criação.
- Atualizar `router.tsx` (rotas /tickets, /tickets/new, /tickets/:id) e a Sidebar.

## Ordem de commits sugerida
1. `feat(tickets): add service, schemas, controller and routes with RBAC`
2. `feat(users): add technicians listing endpoint`
3. `feat(frontend): add tickets service, badges and app layout`
4. `feat(frontend): add tickets list, detail and new ticket pages`

## Riscos / atenção
- RBAC no service (não confiar só na rota): toda leitura/escrita revalida o papel.
- Paginação: `skip/take` no Prisma; `totalPages = ceil(total/limit)`.
- Busca: `OR` em title/description com `contains` + `mode: 'insensitive'`.
- Activity log deve ser best-effort dentro da mesma operação (mesma transação
  quando fizer sentido).
