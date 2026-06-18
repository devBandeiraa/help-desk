import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { AppLayout } from '../../components/layout/AppLayout'
import { PriorityBadge, StatusBadge } from '../../components/ui/Badge'
import { useTechnicians, useTicket, useUpdateTicket } from '../../hooks/useTickets'
import {
  CATEGORY_LABEL,
  PRIORITY_LABEL,
  PRIORITY_OPTIONS,
  STATUS_LABEL,
  STATUS_OPTIONS,
} from '../../lib/constants'
import { formatDateTime, timeAgo } from '../../lib/format'
import { useAuthStore } from '../../store/authStore'
import type { Priority, TicketStatus } from '../../types'

export function TicketDetailPage() {
  const { id = '' } = useParams()
  const role = useAuthStore((s) => s.user?.role)
  const isAgent = role === 'ADMIN' || role === 'TECHNICIAN'
  const { data: ticket, isLoading } = useTicket(id)
  const { data: technicians } = useTechnicians()
  const update = useUpdateTicket(id)

  if (isLoading || !ticket) {
    return (
      <AppLayout title="Chamado">
        <p className="text-slate-400">Carregando...</p>
      </AppLayout>
    )
  }

  return (
    <AppLayout title={`Chamado`}>
      <Link to="/tickets" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" /> Voltar para chamados
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna principal */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">{ticket.title}</h2>
            <p className="mt-3 whitespace-pre-line text-slate-700">{ticket.description}</p>
          </div>

          {/* Comentários (placeholder do M4) */}
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-400">
            Comentários e anexos chegam no M4.
            {ticket.comments && ticket.comments.length > 0 && (
              <span> ({ticket.comments.length} comentário(s) já no banco.)</span>
            )}
          </div>

          {/* Timeline de atividades */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 font-semibold text-slate-800">Histórico</h3>
            <ul className="space-y-3">
              {ticket.activities?.map((a) => (
                <li key={a.id} className="flex items-start gap-3 text-sm">
                  <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />
                  <div>
                    <p className="text-slate-700">
                      {a.description}
                      {a.oldValue && a.newValue && (
                        <span className="text-slate-400">
                          {' '}
                          ({a.oldValue} → {a.newValue})
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-400">
                      {a.user.name} · {timeAgo(a.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sidebar de detalhes */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm">
            <h3 className="mb-3 font-semibold text-slate-800">Detalhes</h3>

            <Field label="Status">
              {isAgent ? (
                <select
                  value={ticket.status}
                  onChange={(e) => update.mutate({ status: e.target.value as TicketStatus })}
                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              ) : (
                <StatusBadge status={ticket.status} />
              )}
            </Field>

            <Field label="Prioridade">
              {role === 'ADMIN' ? (
                <select
                  value={ticket.priority}
                  onChange={(e) => update.mutate({ priority: e.target.value as Priority })}
                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {PRIORITY_LABEL[p]}
                    </option>
                  ))}
                </select>
              ) : (
                <PriorityBadge priority={ticket.priority} />
              )}
            </Field>

            <Field label="Categoria">
              <span className="text-slate-700">{CATEGORY_LABEL[ticket.category]}</span>
            </Field>

            <Field label="Responsável">
              {role === 'ADMIN' ? (
                <select
                  value={ticket.assignee?.id ?? ''}
                  onChange={(e) => update.mutate({ assigneeId: e.target.value || null })}
                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Não atribuído</option>
                  {technicians?.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-slate-700">{ticket.assignee?.name ?? '—'}</span>
              )}
            </Field>

            <Field label="Solicitante">
              <span className="text-slate-700">{ticket.creator.name}</span>
            </Field>

            <Field label="Criado em">
              <span className="text-slate-700">{formatDateTime(ticket.createdAt)}</span>
            </Field>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <p className="mb-1 text-xs uppercase text-slate-400">{label}</p>
      {children}
    </div>
  )
}
