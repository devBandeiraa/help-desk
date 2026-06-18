import { Link } from 'react-router-dom'
import { AppLayout } from '../../components/layout/AppLayout'
import { useAuthStore } from '../../store/authStore'

/** Placeholder do M2/M3 — o dashboard analítico real chega no M5. */
export function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  return (
    <AppLayout title="Dashboard">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold text-slate-900">Olá, {user?.name} 👋</h2>
        <p className="mt-2 text-slate-600">
          Você está autenticado como <strong>{user?.role}</strong> ({user?.email}).
        </p>
        <Link
          to="/tickets"
          className="mt-4 inline-block rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          Ver chamados
        </Link>
        <p className="mt-4 text-sm text-slate-400">
          O dashboard analítico com gráficos chega no M5.
        </p>
      </div>
    </AppLayout>
  )
}
