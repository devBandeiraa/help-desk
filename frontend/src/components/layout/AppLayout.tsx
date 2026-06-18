import { Headset, LayoutDashboard, LogOut, Ticket } from 'lucide-react'
import { ReactNode } from 'react'
import toast from 'react-hot-toast'
import { NavLink, useNavigate } from 'react-router-dom'
import { authService } from '../../services/auth.service'
import { useAuthStore } from '../../store/authStore'
import { initials } from '../../lib/format'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tickets', label: 'Chamados', icon: Ticket },
]

export function AppLayout({ children, title }: { children: ReactNode; title: string }) {
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
    <div className="flex min-h-screen bg-surface-secondary">
      {/* Sidebar */}
      <aside className="hidden w-60 flex-col bg-slate-900 text-slate-300 md:flex">
        <div className="flex items-center gap-2 px-6 py-5 text-lg font-bold text-white">
          <Headset className="h-6 w-6 text-brand-400" /> HelpDesk Pro
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? 'border-l-2 border-brand-500 bg-brand-500/20 text-brand-400'
                    : 'hover:bg-slate-800'
                }`
              }
            >
              <Icon className="h-5 w-5" /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white">
              {user ? initials(user.name) : '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user?.name}</p>
              <p className="truncate text-xs text-slate-400">{user?.role}</p>
            </div>
            <button onClick={handleLogout} title="Sair" className="text-slate-400 hover:text-white">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 md:hidden"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
