import { AlertCircle, CheckCircle, Clock, Ticket as TicketIcon } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { AppLayout } from '../../components/layout/AppLayout'
import { StatCard } from '../../components/ui/StatCard'
import { useDashboard } from '../../hooks/useDashboard'
import { CATEGORY_LABEL, PRIORITY_LABEL, STATUS_LABEL } from '../../lib/constants'
import { timeAgo } from '../../lib/format'
import { useAuthStore } from '../../store/authStore'
import type { Category, Priority, TicketStatus } from '../../types'

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 font-semibold text-slate-800">{title}</h3>
      {children}
    </div>
  )
}

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'ADMIN'
  const { data, isLoading } = useDashboard()

  return (
    <AppLayout title="Dashboard">
      <h2 className="mb-1 text-xl font-bold text-slate-900">Olá, {user?.name} 👋</h2>
      <p className="mb-6 text-sm text-slate-500">Visão geral dos chamados</p>

      {isLoading || !data ? (
        <p className="text-slate-400">Carregando métricas...</p>
      ) : (
        <div className="space-y-6">
          {/* Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total de chamados" value={data.summary.total} icon={TicketIcon} color="bg-brand-100 text-brand-600" />
            <StatCard label="Em aberto" value={data.summary.open} icon={AlertCircle} color="bg-blue-100 text-blue-600" />
            <StatCard label="Em andamento" value={data.summary.inProgress} icon={Clock} color="bg-amber-100 text-amber-600" />
            <StatCard label="Resolvidos" value={data.summary.resolved} icon={CheckCircle} color="bg-green-100 text-green-600" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            {/* Linha: criados vs resolvidos */}
            <div className="lg:col-span-3">
              <Panel title="Criados × Resolvidos (30 dias)">
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={data.ticketsPerDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} fontSize={11} />
                    <YAxis allowDecimals={false} fontSize={11} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="created" name="Criados" stroke="#6366f1" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="resolved" name="Resolvidos" stroke="#22c55e" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Panel>
            </div>

            {/* Pizza por status */}
            <div className="lg:col-span-2">
              <Panel title="Por status">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={data.byStatus.filter((s) => s.count > 0)}
                      dataKey="count"
                      nameKey="status"
                      innerRadius={50}
                      outerRadius={90}
                      label={(e) => STATUS_LABEL[e.status as TicketStatus]}
                    >
                      {data.byStatus.map((s) => (
                        <Cell key={s.status} fill={s.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, STATUS_LABEL[n as TicketStatus]]} />
                  </PieChart>
                </ResponsiveContainer>
              </Panel>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Barras por prioridade */}
            <Panel title="Por prioridade">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.byPriority.map((p) => ({ ...p, label: PRIORITY_LABEL[p.priority as Priority] }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" fontSize={11} />
                  <YAxis allowDecimals={false} fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="count" name="Chamados" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Panel>

            {/* Barras por categoria */}
            <Panel title="Por categoria">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  layout="vertical"
                  data={data.byCategory.map((c) => ({ ...c, label: CATEGORY_LABEL[c.category as Category] }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" allowDecimals={false} fontSize={11} />
                  <YAxis type="category" dataKey="label" width={90} fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="count" name="Chamados" fill="#818cf8" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Panel>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Ranking de técnicos (admin) */}
            {isAdmin && (
              <Panel title="Ranking de técnicos">
                {data.topTechnicians.length === 0 ? (
                  <p className="text-sm text-slate-400">Sem dados ainda.</p>
                ) : (
                  <ul className="space-y-2">
                    {data.topTechnicians.map((t, i) => (
                      <li key={t.id} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-slate-700">
                          <span className="text-slate-400">#{i + 1}</span> {t.name}
                        </span>
                        <span className="font-medium text-slate-800">{t.resolved} resolvidos</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            )}

            {/* Atividade recente */}
            <Panel title="Atividade recente">
              <ul className="space-y-3">
                {data.recentActivity.map((a) => (
                  <li key={a.id} className="flex items-start gap-3 text-sm">
                    <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />
                    <div>
                      <p className="text-slate-700">
                        {a.description} <span className="text-slate-400">em "{a.ticket.title}"</span>
                      </p>
                      <p className="text-xs text-slate-400">
                        {a.user.name} · {timeAgo(a.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
