import {
  ArrowRight,
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  Check,
  Clock,
  Eye,
  EyeOff,
  Headphones,
  Loader2,
  Lock,
  Mail,
  Send,
  ShieldCheck,
  Ticket,
  Users,
} from 'lucide-react'
import {
  FormEvent,
  MouseEvent as ReactMouseEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { BrandLogo } from '../../components/ui/Logo'
import { authService } from '../../services/auth.service'
import { useAuthStore } from '../../store/authStore'

const NAV_LINKS = [
  { label: 'Home', target: 'topo' },
  { label: 'Recursos', target: 'recursos' },
  { label: 'Soluções', target: 'solucoes' },
  { label: 'Contato', target: 'contato' },
] as const

const FEATURES = [
  {
    icon: Ticket,
    title: 'Gestão de tickets',
    desc: 'Crie, atribua e acompanhe chamados do início ao fim com histórico completo.',
  },
  {
    icon: Clock,
    title: 'SLA automatizado',
    desc: 'Defina prazos e receba alertas antes que um chamado estoure o SLA.',
  },
  {
    icon: BarChart3,
    title: 'Dashboards em tempo real',
    desc: 'Métricas de volume, status e produtividade atualizadas ao vivo.',
  },
  {
    icon: Users,
    title: 'Colaboração entre equipes',
    desc: 'Comentários, menções e atribuição para resolver chamados mais rápido.',
  },
  {
    icon: Bell,
    title: 'Notificações',
    desc: 'Avisos instantâneos de novas respostas e mudanças de status.',
  },
  {
    icon: ShieldCheck,
    title: 'Controle de acesso',
    desc: 'Permissões por papel (Admin, Técnico, Cliente) com escopo de dados.',
  },
]

const SOLUTIONS = [
  {
    icon: Building2,
    title: 'TI Interno',
    desc: 'Centralize solicitações de infraestrutura, acesso e hardware da empresa.',
  },
  {
    icon: Headphones,
    title: 'Atendimento ao Cliente',
    desc: 'Ofereça suporte externo com SLA definido e satisfação acompanhada.',
  },
  {
    icon: Briefcase,
    title: 'Suporte a Produto',
    desc: 'Organize bugs e dúvidas por categoria e prioridade em um só lugar.',
  },
]

/** Smooth-scroll helper used by the navbar + CTA. */
function scrollToSection(id: string) {
  if (id === 'topo') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

const BENEFITS = [
  'Gestão completa de tickets',
  'SLA automatizado',
  'Dashboards em tempo real',
  'Colaboração entre equipes',
]

const DEMO = [
  { role: 'Admin', email: 'admin@helpdesk.com', pass: 'Helpdesk@Admin2026' },
  { role: 'Técnico', email: 'tecnico1@helpdesk.com', pass: 'Helpdesk@Tech2026' },
  { role: 'Cliente', email: 'cliente1@helpdesk.com', pass: 'Helpdesk@Cliente2026' },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function LoginPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState({ email: false, password: false })

  // Mouse parallax (shared by background orbs + illustration)
  const [parallax, setParallax] = useState({ x: 0, y: 0 })
  const rafRef = useRef<number>()

  const handleParallax = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    const px = e.clientX / window.innerWidth - 0.5
    const py = e.clientY / window.innerHeight - 0.5
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => setParallax({ x: px, y: py }))
  }, [])

  // Real-time validation
  const emailError = useMemo(() => {
    if (!touched.email || email === '') return ''
    return EMAIL_RE.test(email) ? '' : 'Informe um e-mail válido'
  }, [email, touched.email])

  const passwordError = useMemo(() => {
    if (!touched.password || password === '') return ''
    return password.length >= 6 ? '' : 'Mínimo de 6 caracteres'
  }, [password, touched.password])

  const emailValid = EMAIL_RE.test(email)
  const passwordValid = password.length >= 6

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setTouched({ email: true, password: true })
    if (!emailValid || !passwordValid) return
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
    <div
      onMouseMove={handleParallax}
      className="relative min-h-screen overflow-hidden bg-ink-950 font-sans text-mist-50 antialiased"
    >
      <TechBackground parallax={parallax} />
      <Navbar onNavigate={scrollToSection} />

      <main
        id="topo"
        className="relative z-10 mx-auto flex min-h-screen max-w-7xl scroll-mt-28 flex-col items-center gap-12 px-6 pb-16 pt-28 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-8 lg:pt-24"
      >
        <HeroPanel parallax={parallax} />
        <LoginCard
          email={email}
          password={password}
          showPass={showPass}
          remember={remember}
          loading={loading}
          emailError={emailError}
          passwordError={passwordError}
          onEmail={setEmail}
          onPassword={setPassword}
          onTogglePass={() => setShowPass((v) => !v)}
          onToggleRemember={() => setRemember((v) => !v)}
          onBlurEmail={() => setTouched((t) => ({ ...t, email: true }))}
          onBlurPassword={() => setTouched((t) => ({ ...t, password: true }))}
          onSubmit={handleSubmit}
          onDemo={(d) => {
            setEmail(d.email)
            setPassword(d.pass)
            setTouched({ email: true, password: true })
          }}
        />
      </main>

      <FeaturesSection />
      <SolutionsSection />
      <ContactSection />
      <SiteFooter onNavigate={scrollToSection} />
    </div>
  )
}

/* ----------------------------------------------------------------------- */
/* Background: dark gradient + tech grid + glow orbs + floating particles  */
/* ----------------------------------------------------------------------- */
function TechBackground({ parallax }: { parallax: { x: number; y: number } }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        left: `${(i * 37) % 100}%`,
        top: `${(i * 53) % 100}%`,
        size: 1 + (i % 3),
        delay: `${(i % 7) * 0.9}s`,
        duration: `${7 + (i % 6)}s`,
      })),
    [],
  )

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Base radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_90%_at_50%_-10%,#23232f_0%,#16161d_45%,#0d0d13_100%)]" />

      {/* Geometric grid texture with radial fade */}
      <div className="bg-tech-grid mask-radial-fade absolute inset-0" />

      {/* Glow orbs (parallax) */}
      <div
        className="animate-pulse-glow absolute -left-32 top-10 h-[34rem] w-[34rem] rounded-full bg-brand-600/25 blur-[120px]"
        style={{
          transform: `translate3d(${parallax.x * 40}px, ${parallax.y * 40}px, 0)`,
        }}
      />
      <div
        className="animate-pulse-glow absolute -right-24 bottom-0 h-[28rem] w-[28rem] rounded-full bg-brand-500/20 blur-[120px]"
        style={{
          transform: `translate3d(${parallax.x * -55}px, ${parallax.y * -35}px, 0)`,
        }}
      />

      {/* Discrete floating particles */}
      {particles.map((p, i) => (
        <span
          key={i}
          className="animate-float absolute rounded-full bg-white/40"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}

      {/* Top vignette for navbar legibility */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink-950/80 to-transparent" />
    </div>
  )
}

/* ----------------------------------------------------------------------- */
/* Navbar: fixed, glass, animated underline links, CTA                      */
/* ----------------------------------------------------------------------- */
function Navbar({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
    <header className="fixed inset-x-0 top-0 z-30 animate-fade-in px-4">
      <nav className="mx-auto mt-3 flex max-w-7xl items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-3 backdrop-blur-20 lg:mt-4 lg:px-6">
        <button
          type="button"
          onClick={() => onNavigate('topo')}
          className="group flex items-center"
        >
          <BrandLogo
            markClassName="h-9 w-9 transition-transform group-hover:scale-105"
            textClassName="text-lg"
          />
        </button>

        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.target}>
              <button
                type="button"
                onClick={() => onNavigate(link.target)}
                className="group relative text-sm font-medium text-mist-200 transition-colors hover:text-white"
              >
                {link.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-300 group-hover:w-full" />
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => onNavigate('contato')}
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white transition-all hover:border-brand-400/40 hover:bg-white/[0.07]"
        >
          <span className="relative z-10">Solicitar Demonstração</span>
          <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </nav>
    </header>
  )
}

/* ----------------------------------------------------------------------- */
/* Hero panel: headline, subtitle, benefits, geometric illustration         */
/* ----------------------------------------------------------------------- */
function HeroPanel({ parallax }: { parallax: { x: number; y: number } }) {
  return (
    <section className="w-full max-w-xl">
      <span className="animate-fade-up delay-1 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs font-medium text-mist-200 backdrop-blur">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-400 shadow-[0_0_8px_2px] shadow-brand-400/60" />
        Plataforma de suporte enterprise
      </span>

      <h1 className="animate-fade-up delay-2 mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-[48px]">
        Transformando suporte em{' '}
        <span className="bg-gradient-to-r from-brand-300 via-brand-400 to-brand-600 bg-clip-text text-transparent">
          experiências excepcionais.
        </span>
      </h1>

      <p className="animate-fade-up delay-3 mt-5 max-w-md text-lg leading-relaxed text-mist-200">
        Centralize chamados, acompanhe métricas em tempo real e aumente a
        produtividade da sua equipe.
      </p>

      <ul className="animate-fade-up delay-4 mt-8 grid gap-3 sm:grid-cols-2">
        {BENEFITS.map((b) => (
          <li key={b} className="flex items-center gap-3 text-sm text-mist-200">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/15 ring-1 ring-brand-400/30">
              <Check className="h-3 w-3 text-brand-300" />
            </span>
            {b}
          </li>
        ))}
      </ul>

      <HeroIllustration parallax={parallax} />
    </section>
  )
}

/* Geometric / isometric wireframe illustration with float + parallax */
function HeroIllustration({ parallax }: { parallax: { x: number; y: number } }) {
  return (
    <div
      className="animate-fade-up delay-5 relative mt-12 hidden h-44 select-none lg:block"
      style={{
        transform: `translate3d(${parallax.x * 18}px, ${parallax.y * 18}px, 0)`,
      }}
    >
      <svg
        viewBox="0 0 520 200"
        fill="none"
        className="animate-float-slow h-full w-full overflow-visible text-brand-400"
      >
        <defs>
          <linearGradient id="line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
        </defs>

        {/* connecting lines */}
        <g stroke="url(#line)" strokeWidth="1" opacity="0.5">
          <path d="M90 120 L210 70 L360 110 L460 60" />
          <path d="M90 120 L210 150 L360 110" />
          <path d="M210 70 L210 150" />
        </g>

        {/* nodes */}
        {[
          [90, 120],
          [210, 70],
          [210, 150],
          [360, 110],
          [460, 60],
        ].map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="14" fill="#6366f1" opacity="0.12" />
            <circle
              cx={cx}
              cy={cy}
              r="5"
              fill="#a5b4fc"
              className="animate-pulse-glow"
              style={{ animationDelay: `${i * 0.6}s` }}
            />
          </g>
        ))}

        {/* isometric card */}
        <g
          stroke="url(#line)"
          strokeWidth="1.5"
          fill="rgba(99,102,241,0.06)"
          opacity="0.9"
        >
          <path d="M300 30 L370 14 L430 40 L360 56 Z" />
          <path d="M300 30 L300 60 L360 86 L360 56 Z" />
          <path d="M360 56 L360 86 L430 70 L430 40 Z" />
        </g>
      </svg>
    </div>
  )
}

/* ----------------------------------------------------------------------- */
/* Login card: glassmorphism, floating labels, validation, ripple button    */
/* ----------------------------------------------------------------------- */
interface LoginCardProps {
  email: string
  password: string
  showPass: boolean
  remember: boolean
  loading: boolean
  emailError: string
  passwordError: string
  onEmail: (v: string) => void
  onPassword: (v: string) => void
  onTogglePass: () => void
  onToggleRemember: () => void
  onBlurEmail: () => void
  onBlurPassword: () => void
  onSubmit: (e: FormEvent) => void
  onDemo: (d: (typeof DEMO)[number]) => void
}

function LoginCard(props: LoginCardProps) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])

  function spawnRipple(e: ReactMouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const id = Date.now()
    setRipples((r) => [
      ...r,
      { id, x: e.clientX - rect.left - size / 2, y: e.clientY - rect.top - size / 2 },
    ])
    setTimeout(() => setRipples((r) => r.filter((it) => it.id !== id)), 600)
  }

  return (
    <section className="animate-fade-up delay-3 w-full max-w-md lg:justify-self-end">
      <div className="relative">
        {/* Outer glow */}
        <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-brand-500/30 to-transparent opacity-60 blur-sm" />

        <div className="relative rounded-3xl border border-white/[0.08] bg-white/[0.04] p-7 shadow-2xl shadow-black/40 backdrop-blur-20 sm:p-8">
          {/* glass reflection */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          <h2 className="font-display text-2xl font-bold tracking-tight text-white">
            Entrar
          </h2>
          <p className="mt-1 text-sm text-mist-400">
            Acesse sua conta para continuar
          </p>

          <form onSubmit={props.onSubmit} className="mt-7 space-y-4" noValidate>
            <FloatingField
              id="email"
              type="email"
              label="E-mail"
              value={props.email}
              error={props.emailError}
              valid={!props.emailError && props.email.length > 0}
              icon={<Mail className="h-4 w-4" />}
              onChange={props.onEmail}
              onBlur={props.onBlurEmail}
              autoComplete="email"
            />

            <FloatingField
              id="password"
              type={props.showPass ? 'text' : 'password'}
              label="Senha"
              value={props.password}
              error={props.passwordError}
              valid={!props.passwordError && props.password.length > 0}
              icon={<Lock className="h-4 w-4" />}
              onChange={props.onPassword}
              onBlur={props.onBlurPassword}
              autoComplete="current-password"
              trailing={
                <button
                  type="button"
                  onClick={props.onTogglePass}
                  aria-label={props.showPass ? 'Ocultar senha' : 'Mostrar senha'}
                  className="text-mist-400 transition-colors hover:text-white"
                >
                  {props.showPass ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
            />

            <div className="flex items-center justify-between pt-1 text-sm">
              <button
                type="button"
                onClick={props.onToggleRemember}
                className="group inline-flex items-center gap-2 text-mist-200"
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded border transition-all ${
                    props.remember
                      ? 'border-brand-400 bg-brand-500'
                      : 'border-white/20 bg-white/[0.03] group-hover:border-white/40'
                  }`}
                >
                  {props.remember && <Check className="h-3 w-3 text-white" />}
                </span>
                Lembrar-me
              </button>
              <a
                href="#"
                className="font-medium text-brand-300 transition-colors hover:text-brand-200"
              >
                Esqueceu a senha?
              </a>
            </div>

            <button
              type="submit"
              disabled={props.loading}
              onClick={spawnRipple}
              className="group relative mt-2 inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 px-4 py-3 font-semibold text-white shadow-lg shadow-brand-600/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-brand-600/40 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
            >
              {/* animated gradient sheen */}
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              {ripples.map((r) => (
                <span
                  key={r.id}
                  className="ripple"
                  style={{ left: r.x, top: r.y, width: 80, height: 80 }}
                />
              ))}
              <span className="relative z-10 flex items-center gap-2">
                {props.loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    Entrar
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </span>
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-mist-400">
            Não possui conta?{' '}
            <Link
              to="/register"
              className="font-semibold text-brand-300 transition-colors hover:text-brand-200"
            >
              Criar conta
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-mist-400">
              Credenciais de demonstração
            </p>
            <div className="flex flex-wrap gap-2">
              {DEMO.map((d) => (
                <button
                  key={d.email}
                  type="button"
                  onClick={() => props.onDemo(d)}
                  className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-mist-200 transition-all hover:border-brand-400/40 hover:bg-brand-500/10 hover:text-white"
                >
                  {d.role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* Reusable floating-label glass input with validation states */
interface FloatingFieldProps {
  id: string
  type: string
  label: string
  value: string
  error: string
  valid: boolean
  icon: React.ReactNode
  onChange: (v: string) => void
  onBlur: () => void
  autoComplete?: string
  trailing?: React.ReactNode
}

function FloatingField(props: FloatingFieldProps) {
  const borderColor = props.error
    ? 'border-red-400/60 focus-within:border-red-400 focus-within:ring-red-400/20'
    : props.valid
      ? 'border-emerald-400/40 focus-within:border-emerald-400/60 focus-within:ring-emerald-400/15'
      : 'border-white/[0.08] focus-within:border-brand-400/70 focus-within:ring-brand-500/20'

  return (
    <div>
      <div
        className={`group relative flex items-center rounded-xl border bg-white/[0.02] transition-all duration-300 focus-within:ring-4 ${borderColor}`}
      >
        <span className="pointer-events-none absolute left-3.5 text-mist-400 transition-colors group-focus-within:text-brand-300">
          {props.icon}
        </span>

        <input
          id={props.id}
          type={props.type}
          required
          placeholder=" "
          value={props.value}
          autoComplete={props.autoComplete}
          onChange={(e) => props.onChange(e.target.value)}
          onBlur={props.onBlur}
          aria-invalid={!!props.error}
          className="glass-input peer w-full bg-transparent px-10 pb-2 pt-5 text-[16px] font-medium text-white outline-none placeholder:text-transparent"
        />

        <label
          htmlFor={props.id}
          className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-[16px] text-mist-400 transition-all duration-200 peer-focus:top-3.5 peer-focus:text-xs peer-focus:text-brand-300 peer-[:not(:placeholder-shown)]:top-3.5 peer-[:not(:placeholder-shown)]:text-xs"
        >
          {props.label}
        </label>

        {props.trailing && (
          <span className="absolute right-3.5">{props.trailing}</span>
        )}
      </div>

      {props.error && (
        <p className="animate-fade-in mt-1.5 pl-1 text-xs text-red-400">
          {props.error}
        </p>
      )}
    </div>
  )
}

/* ----------------------------------------------------------------------- */
/* Shared section header                                                    */
/* ----------------------------------------------------------------------- */
function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string
  title: string
  subtitle: string
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs font-medium uppercase tracking-wider text-brand-300">
        {eyebrow}
      </span>
      <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-mist-200">
        {subtitle}
      </p>
    </div>
  )
}

/* Reusable glass card with hover glow */
function GlassCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: typeof Ticket
  title: string
  desc: string
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-400/30 hover:bg-white/[0.05]">
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand-500/0 blur-2xl transition-all duration-500 group-hover:bg-brand-500/20" />
      <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/15 ring-1 ring-brand-400/30">
        <Icon className="h-5 w-5 text-brand-300" />
      </span>
      <h3 className="relative mt-4 font-display text-lg font-semibold text-white">
        {title}
      </h3>
      <p className="relative mt-2 text-sm leading-relaxed text-mist-200">{desc}</p>
    </div>
  )
}

/* ----------------------------------------------------------------------- */
/* Recursos                                                                 */
/* ----------------------------------------------------------------------- */
function FeaturesSection() {
  return (
    <section
      id="recursos"
      className="relative z-10 mx-auto max-w-7xl scroll-mt-28 px-6 py-24"
    >
      <SectionHeader
        eyebrow="Recursos"
        title="Tudo que sua equipe precisa para dar suporte"
        subtitle="Recursos pensados para reduzir o tempo de resposta e dar visibilidade total sobre cada chamado."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <GlassCard key={f.title} {...f} />
        ))}
      </div>
    </section>
  )
}

/* ----------------------------------------------------------------------- */
/* Soluções                                                                 */
/* ----------------------------------------------------------------------- */
function SolutionsSection() {
  return (
    <section
      id="solucoes"
      className="relative z-10 mx-auto max-w-7xl scroll-mt-28 px-6 py-24"
    >
      <SectionHeader
        eyebrow="Soluções"
        title="Feito para o seu tipo de operação"
        subtitle="Da TI interna ao atendimento externo, adapte o HelpDesk Pro ao fluxo do seu time."
      />
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {SOLUTIONS.map((s) => (
          <GlassCard key={s.title} {...s} />
        ))}
      </div>
    </section>
  )
}

/* ----------------------------------------------------------------------- */
/* Contato (também alvo do CTA "Solicitar Demonstração")                    */
/* ----------------------------------------------------------------------- */
function ContactSection() {
  const [sending, setSending] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' })

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSending(true)
    // Sem backend: simula envio e confirma com toast.
    setTimeout(() => {
      setSending(false)
      setForm({ name: '', email: '', company: '', message: '' })
      toast.success('Solicitação enviada! Em breve entraremos em contato.')
    }, 900)
  }

  const inputClass =
    'w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-[15px] text-white outline-none transition-all duration-300 placeholder:text-mist-400 focus:border-brand-400/70 focus:ring-4 focus:ring-brand-500/20'

  return (
    <section
      id="contato"
      className="relative z-10 mx-auto max-w-3xl scroll-mt-28 px-6 py-24"
    >
      <SectionHeader
        eyebrow="Contato"
        title="Solicite uma demonstração"
        subtitle="Conte um pouco sobre sua equipe e mostraremos como o HelpDesk Pro funciona na prática."
      />

      <form
        onSubmit={handleSubmit}
        className="relative mt-10 rounded-3xl border border-white/[0.08] bg-white/[0.04] p-7 shadow-2xl shadow-black/40 backdrop-blur-20 sm:p-8"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        <div className="grid gap-4 sm:grid-cols-2">
          <input
            required
            value={form.name}
            onChange={set('name')}
            placeholder="Seu nome"
            className={inputClass}
          />
          <input
            required
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="E-mail corporativo"
            className={inputClass}
          />
        </div>
        <input
          value={form.company}
          onChange={set('company')}
          placeholder="Empresa"
          className={`${inputClass} mt-4`}
        />
        <textarea
          required
          value={form.message}
          onChange={set('message')}
          placeholder="Como podemos ajudar?"
          rows={4}
          className={`${inputClass} mt-4 resize-none`}
        />

        <button
          type="submit"
          disabled={sending}
          className="group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 px-4 py-3 font-semibold text-white shadow-lg shadow-brand-600/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-brand-600/40 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
        >
          {sending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Enviar solicitação
            </>
          )}
        </button>
      </form>
    </section>
  )
}

/* ----------------------------------------------------------------------- */
/* Footer                                                                    */
/* ----------------------------------------------------------------------- */
function SiteFooter({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
    <footer className="relative z-10 border-t border-white/[0.08]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <button
          type="button"
          onClick={() => onNavigate('topo')}
          className="flex items-center"
        >
          <BrandLogo markClassName="h-8 w-8" textClassName="text-base" />
        </button>
        <div className="flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <button
              key={link.target}
              type="button"
              onClick={() => onNavigate(link.target)}
              className="text-sm text-mist-400 transition-colors hover:text-white"
            >
              {link.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-mist-400">
          © {new Date().getFullYear()} HelpDesk Pro
        </p>
      </div>
    </footer>
  )
}
