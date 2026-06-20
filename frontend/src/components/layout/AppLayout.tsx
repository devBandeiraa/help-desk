import { LayoutDashboard, LogOut, Ticket } from 'lucide-react'
import { ReactNode } from 'react'
import toast from 'react-hot-toast'
import { NavLink, useNavigate } from 'react-router-dom'
import { authService } from '../../services/auth.service'
import { useAuthStore } from '../../store/authStore'
import { initials } from '../../lib/format'
import { BrandLogo } from '../ui/Logo'

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
    <div className="app-shell relative flex">
      {/* Backdrop: dark gradient + subtle grid */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_30%_-10%,#23232f_0%,#16161d_45%,#0d0d13_100%)]" />
        <div className="bg-tech-grid absolute inset-0 opacity-60" />
        <div className="absolute -left-40 top-0 h-[30rem] w-[30rem] rounded-full bg-brand-600/10 blur-[120px]" />
      </div>

      {/* Sidebar */}
      <aside className="sticky top-0 z-20 hidden h-screen w-60 flex-col border-r border-white/[0.08] bg-white/[0.03] backdrop-blur-20 md:flex">
        <div className="px-6 py-5">
          <BrandLogo markClassName="h-9 w-9" textClassName="text-lg" />
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-brand-500/15 text-brand-300 ring-1 ring-inset ring-brand-400/30'
                    : 'text-mist-200 hover:bg-white/[0.05] hover:text-white'
                }`
              }
            >
              <Icon className="h-5 w-5" /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/[0.08] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-semibold text-white">
              {user ? initials(user.name) : '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user?.name}</p>
              <p className="truncate text-xs text-mist-400">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sair"
              className="text-mist-400 transition-colors hover:text-white"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Conteúdo */}
      <div className="relative z-10 flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.08] bg-ink-950/70 px-6 py-4 backdrop-blur-20">
          <h1 className="font-display text-lg font-semibold text-white">{title}</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-mist-200 transition-colors hover:text-white md:hidden"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
