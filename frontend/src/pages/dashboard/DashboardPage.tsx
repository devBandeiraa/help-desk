import { LogOut } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../services/auth.service'
import { useAuthStore } from '../../store/authStore'

/** Placeholder do M2 — o dashboard real chega no M5. */
export function DashboardPage() {
  const navigate = useNavigate()
  const { user, refreshToken, clear } = useAuthStore()

  async function handleLogout() {
    try {
      if (refreshToken) await authService.logout(refreshToken)
    } finally {
      clear()
      toast.success('Sessão encerrada')
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-surface-secondary p-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">
            Olá, {user?.name} 👋
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-slate-600">
            Você está autenticado como <strong>{user?.role}</strong> ({user?.email}).
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Este é um placeholder do M2. A lista de chamados chega no M3 e o dashboard
            analítico no M5.
          </p>
        </div>
      </div>
    </div>
  )
}
