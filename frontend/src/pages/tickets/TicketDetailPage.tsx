import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Download, Loader2, Paperclip, Trash2 } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
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
import { formatDateTime, initials, timeAgo } from '../../lib/format'
import { attachmentsService, commentsService } from '../../services/comments.service'
import { useAuthStore } from '../../store/authStore'
import type { Priority, TicketStatus } from '../../types'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function TicketDetailPage() {
  const { id = '' } = useParams()
  const qc = useQueryClient()
  const role = useAuthStore((s) => s.user?.role)
  const isAgent = role === 'ADMIN' || role === 'TECHNICIAN'
  const { data: ticket, isLoading } = useTicket(id)
  const { data: technicians } = useTechnicians()
  const update = useUpdateTicket(id)

  const [comment, setComment] = useState('')
  const [internal, setInternal] = useState(false)

  const refresh = () => qc.invalidateQueries({ queryKey: ['ticket', id] })

  const addComment = useMutation({
    mutationFn: () => commentsService.create(id, comment, internal),
    onSuccess: () => {
      setComment('')
      setInternal(false)
      refresh()
      toast.success('Comentário adicionado')
    },
    onError: () => toast.error('Não foi possível comentar'),
  })

  const upload = useMutation({
    mutationFn: (files: FileList) => attachmentsService.upload(id, files),
    onSuccess: () => {
      refresh()
      toast.success('Anexo enviado')
    },
    onError: () => toast.error('Falha no upload (tipo ou tamanho inválido)'),
  })

  const removeAttachment = useMutation({
    mutationFn: (attId: string) => attachmentsService.remove(attId),
    onSuccess: () => {
      refresh()
      toast.success('Anexo removido')
    },
  })

  if (isLoading || !ticket) {
    return (
      <AppLayout title="Chamado">
        <p className="text-mist-400">Carregando...</p>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Chamado">
      <Link to="/tickets" className="mb-4 inline-flex items-center gap-1 text-sm text-mist-400 transition-colors hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Voltar para chamados
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna principal */}
        <div className="space-y-6 lg:col-span-2">
          <div className="panel p-6">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <h2 className="font-display text-xl font-bold text-white">{ticket.title}</h2>
            <p className="mt-3 whitespace-pre-line text-mist-200">{ticket.description}</p>
          </div>

          {/* Anexos */}
          <div className="panel p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display font-semibold text-white">Anexos</h3>
              <label className="btn-ghost cursor-pointer px-3 py-1.5 text-sm">
                {upload.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
                Enviar arquivo
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.length) upload.mutate(e.target.files)
                    e.target.value = ''
                  }}
                />
              </label>
            </div>
            {ticket.attachments && ticket.attachments.length > 0 ? (
              <ul className="space-y-2">
                {ticket.attachments.map((a) => (
                  <li key={a.id} className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-sm">
                    <span className="flex items-center gap-2 text-mist-200">
                      <Paperclip className="h-4 w-4 text-mist-400" />
                      {a.originalName}
                      <span className="text-xs text-mist-400">({formatBytes(a.size)})</span>
                    </span>
                    <span className="flex items-center gap-3">
                      <button
                        onClick={() => attachmentsService.download(a.id, a.originalName)}
                        className="text-mist-400 transition-colors hover:text-brand-300"
                        title="Baixar"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeAttachment.mutate(a.id)}
                        className="text-mist-400 transition-colors hover:text-red-400"
                        title="Remover"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-mist-400">Nenhum anexo. Tipos aceitos: imagens, PDF, txt, doc (≤10MB).</p>
            )}
          </div>

          {/* Comentários */}
          <div className="panel p-6">
            <h3 className="mb-4 font-display font-semibold text-white">Comentários</h3>
            <ul className="space-y-4">
              {ticket.comments?.length === 0 && (
                <li className="text-sm text-mist-400">Nenhum comentário ainda.</li>
              )}
              {ticket.comments?.map((c) => (
                <li
                  key={c.id}
                  className={`rounded-lg p-3 ${c.isInternal ? 'border border-amber-400/30 bg-amber-500/10' : 'border border-white/[0.06] bg-white/[0.03]'}`}
                >
                  <div className="mb-1 flex items-center gap-2 text-sm">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-[10px] font-semibold text-white">
                      {initials(c.author.name)}
                    </span>
                    <span className="font-medium text-white">{c.author.name}</span>
                    {c.isInternal && (
                      <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                        interno
                      </span>
                    )}
                    <span className="text-xs text-mist-400">{timeAgo(c.createdAt)}</span>
                  </div>
                  <p className="whitespace-pre-line text-sm text-mist-200">{c.content}</p>
                </li>
              ))}
            </ul>

            {/* Novo comentário */}
            <div className="mt-4 border-t border-white/[0.08] pt-4">
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Escreva um comentário..."
                className="input-dark resize-none text-sm"
              />
              <div className="mt-2 flex items-center justify-between">
                {isAgent ? (
                  <label className="flex items-center gap-2 text-sm text-mist-200">
                    <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} className="accent-brand-500" />
                    Comentário interno (não visível ao cliente)
                  </label>
                ) : (
                  <span />
                )}
                <button
                  disabled={!comment.trim() || addComment.isPending}
                  onClick={() => addComment.mutate()}
                  className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
                >
                  {addComment.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Comentar
                </button>
              </div>
            </div>
          </div>

          {/* Histórico */}
          <div className="panel p-6">
            <h3 className="mb-4 font-display font-semibold text-white">Histórico</h3>
            <ul className="space-y-3">
              {ticket.activities?.map((a) => (
                <li key={a.id} className="flex items-start gap-3 text-sm">
                  <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-brand-400 shadow-[0_0_8px_2px] shadow-brand-400/50" />
                  <div>
                    <p className="text-mist-200">
                      {a.description}
                      {a.oldValue && a.newValue && (
                        <span className="text-mist-400">
                          {' '}
                          ({a.oldValue} → {a.newValue})
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-mist-400">
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
          <div className="panel p-5 text-sm">
            <h3 className="mb-3 font-display font-semibold text-white">Detalhes</h3>

            <Field label="Status">
              {isAgent ? (
                <select
                  value={ticket.status}
                  onChange={(e) => update.mutate({ status: e.target.value as TicketStatus })}
                  className="input-dark px-2 py-1.5"
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
                  className="input-dark px-2 py-1.5"
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
              <span className="text-mist-200">{CATEGORY_LABEL[ticket.category]}</span>
            </Field>

            <Field label="Responsável">
              {role === 'ADMIN' ? (
                <select
                  value={ticket.assignee?.id ?? ''}
                  onChange={(e) => update.mutate({ assigneeId: e.target.value || null })}
                  className="input-dark px-2 py-1.5"
                >
                  <option value="">Não atribuído</option>
                  {technicians?.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-mist-200">{ticket.assignee?.name ?? '—'}</span>
              )}
            </Field>

            <Field label="Solicitante">
              <span className="text-mist-200">{ticket.creator.name}</span>
            </Field>

            <Field label="Criado em">
              <span className="text-mist-200">{formatDateTime(ticket.createdAt)}</span>
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
      <p className="mb-1 text-xs uppercase tracking-wider text-mist-400">{label}</p>
      {children}
    </div>
  )
}
