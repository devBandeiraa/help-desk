import { Eye, EyeOff, Headset, Loader2 } from 'lucide-react'
import { FormEvent, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../../services/auth.service'
import { useAuthStore } from '../../store/authStore'

const DEMO = [
  { role: 'Admin', email: 'admin@helpdesk.com', pass: 'admin123' },
  { role: 'Técnico', email: 'tecnico1@helpdesk.com', pass: 'tecnico123' },
  { role: 'Cliente', email: 'cliente1@helpdesk.com', pass: 'cliente123' },
]

export function LoginPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await authService.login({ email, password })
      setSession(result.user, result.accessToken, result.refreshToken)
      toast.success(`Bem-vindo, ${result.user.name}!`)
      navigate('/dashboard')
    } catch {
      toast.error('E-mail ou senha inválidos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Coluna ilustrativa (desktop) */}
      <div className="hidden w-1/2 flex-col justify-between bg-brand-600 p-12 text-white lg:flex">
        <div className="flex items-center gap-2 text-xl font-bold">
          <Headset className="h-7 w-7" /> HelpDesk Pro
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight">Resolvemos juntos. Mais rápido.</h1>
          <ul className="mt-8 space-y-3 text-brand-100">
            <li>• Acompanhe chamados do início ao fim</li>
            <li>• Atribua, priorize e colabore por comentários</li>
            <li>• Dashboard com métricas em tempo real</li>
          </ul>
        </div>
        <p className="text-sm text-brand-200">© {new Date().getFullYear()} HelpDesk Pro</p>
      </div>

      {/* Formulário */}
      <div className="flex w-full items-center justify-center bg-surface-secondary p-6 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 text-2xl font-bold text-slate-900 lg:hidden">
            <Headset className="h-7 w-7 text-brand-600" /> HelpDesk Pro
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Entrar</h2>
          <p className="mt-1 text-sm text-slate-500">Acesse sua conta para continuar</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-brand-500"
                placeholder="voce@empresa.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Senha</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-10 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-brand-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2 font-medium text-white transition-all hover:bg-brand-600 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Aguarde...' : 'Entrar'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-500">
            Não tem conta?{' '}
            <Link to="/register" className="font-medium text-brand-600 hover:underline">
              Criar conta
            </Link>
          </p>

          <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
            <p className="mb-1 font-semibold">Credenciais de demonstração</p>
            {DEMO.map((d) => (
              <button
                key={d.email}
                type="button"
                onClick={() => {
                  setEmail(d.email)
                  setPassword(d.pass)
                }}
                className="block text-left hover:underline"
              >
                {d.role}: {d.email} / {d.pass}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
