import { Plus, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppLayout } from '../../components/layout/AppLayout'
import { PriorityBadge, StatusBadge } from '../../components/ui/Badge'
import { useTickets } from '../../hooks/useTickets'
import {
  CATEGORY_LABEL,
  PRIORITY_OPTIONS,
  STATUS_LABEL,
  STATUS_OPTIONS,
} from '../../lib/constants'
import { formatDate } from '../../lib/format'
import { useAuthStore } from '../../store/authStore'
import type { Priority, TicketStatus } from '../../types'

export function TicketsPage() {
  const navigate = useNavigate()
  const role = useAuthStore((s) => s.user?.role)
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [status, setStatus] = useState<TicketStatus | ''>('')
  const [priority, setPriority] = useState<Priority | ''>('')
  const [page, setPage] = useState(1)

  // debounce da busca
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 500)
    return () => clearTimeout(t)
  }, [search])

  const filters = useMemo(
    () => ({
      page,
      limit: 10,
      search: debounced || undefined,
      status: status || undefined,
      priority: priority || undefined,
    }),
    [page, debounced, status, priority],
  )

  const { data, isLoading } = useTickets(filters)

  function resetFilters() {
    setSearch('')
    setStatus('')
    setPriority('')
    setPage(1)
  }

  return (
    <AppLayout title="Chamados">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-mist-400">{data ? `${data.total} chamado(s)` : ' '}</p>
        <Link to="/tickets/new" className="btn-primary text-sm">
          <Plus className="h-4 w-4" /> Novo Chamado
        </Link>
      </div>

      {/* Filtros */}
      <div className="panel mb-4 flex flex-wrap items-center gap-3 p-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Buscar por título ou descrição..."
            className="input-dark py-2 pl-9 pr-3 text-sm"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as TicketStatus | '')
            setPage(1)
          }}
          className="input-dark w-auto px-3 py-2 text-sm"
        >
          <option value="">Todos os status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) => {
            setPriority(e.target.value as Priority | '')
            setPage(1)
          }}
          className="input-dark w-auto px-3 py-2 text-sm"
        >
          <option value="">Todas prioridades</option>
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <button onClick={resetFilters} className="btn-ghost px-3 py-2 text-sm">
          Limpar
        </button>
      </div>

      {/* Tabela */}
      <div className="panel overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-wider text-mist-400">
            <tr>
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Prioridade</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Solicitante</th>
              <th className="px-4 py-3">Responsável</th>
              <th className="px-4 py-3">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-mist-400">
                  Carregando...
                </td>
              </tr>
            )}
            {!isLoading && data?.data.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-mist-400">
                  Nenhum chamado encontrado.
                </td>
              </tr>
            )}
            {data?.data.map((t) => (
              <tr
                key={t.id}
                onClick={() => navigate(`/tickets/${t.id}`)}
                className="cursor-pointer transition-colors hover:bg-white/[0.04]"
              >
                <td className="px-4 py-3 font-medium text-white">{t.title}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={t.status} />
                </td>
                <td className="px-4 py-3">
                  <PriorityBadge priority={t.priority} />
                </td>
                <td className="px-4 py-3 text-mist-200">{CATEGORY_LABEL[t.category]}</td>
                <td className="px-4 py-3 text-mist-200">{t.creator.name}</td>
                <td className="px-4 py-3 text-mist-200">{t.assignee?.name ?? '—'}</td>
                <td className="px-4 py-3 text-mist-400">{formatDate(t.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {data && data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-end gap-3 text-sm">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="btn-ghost px-3 py-1.5 disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-mist-400">
            Página {data.page} de {data.totalPages}
          </span>
          <button
            disabled={page >= data.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="btn-ghost px-3 py-1.5 disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      )}

      {role === 'CLIENT' && (
        <p className="mt-3 text-xs text-mist-400">Você vê apenas os chamados que abriu.</p>
      )}
    </AppLayout>
  )
}
