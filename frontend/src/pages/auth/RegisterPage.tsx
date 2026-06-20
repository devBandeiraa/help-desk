import { Loader2 } from 'lucide-react'
import { FormEvent, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { BrandLogo } from '../../components/ui/Logo'
import { authService } from '../../services/auth.service'
import { useAuthStore } from '../../store/authStore'

export function RegisterPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await authService.register({ name, email, password })
      setSession(result.user, result.accessToken, result.refreshToken)
      toast.success('Conta criada com sucesso!')
      navigate('/dashboard')
    } catch {
      toast.error('Não foi possível criar a conta (e-mail já em uso?)')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-950 p-6 font-sans text-mist-50 antialiased">
      {/* Backdrop */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_-10%,#23232f_0%,#16161d_45%,#0d0d13_100%)]" />
        <div className="bg-tech-grid mask-radial-fade absolute inset-0" />
        <div className="animate-pulse-glow absolute -left-32 top-0 h-[30rem] w-[30rem] rounded-full bg-brand-600/20 blur-[120px]" />
      </div>

      <div className="animate-fade-up relative w-full max-w-md">
        <Link to="/login" className="mb-8 inline-flex">
          <BrandLogo markClassName="h-9 w-9" textClassName="text-lg" />
        </Link>

        <div className="panel relative p-7 shadow-2xl shadow-black/40 sm:p-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          <h2 className="font-display text-2xl font-bold tracking-tight text-white">Criar conta</h2>
          <p className="mt-1 text-sm text-mist-400">Cadastre-se para abrir chamados</p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-mist-200">Nome</label>
              <input
                required
                minLength={2}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-dark"
                placeholder="Seu nome"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-mist-200">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-dark"
                placeholder="voce@empresa.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-mist-200">Senha</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-dark"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary mt-2 w-full px-4 py-3">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Aguarde...' : 'Criar conta'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-mist-400">
            Já tem conta?{' '}
            <Link to="/login" className="font-semibold text-brand-300 transition-colors hover:text-brand-200">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
