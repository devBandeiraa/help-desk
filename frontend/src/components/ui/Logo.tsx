/**
 * Marca do HelpDesk Pro — hexágonos aninhados (roxo #6C5CE7) com headset branco
 * e ponto do microfone em teal #00D2A0. Baseado no design futurista da marca.
 * O mesmo traçado alimenta o favicon (public/favicon.svg) para identidade
 * consistente entre a aba do navegador e a aplicação.
 */
export function LogoMark({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 130 130"
      className={className}
      fill="none"
      role="img"
      aria-label="HelpDesk Pro"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Hexágono externo */}
      <polygon
        points="65,4 120,32 120,98 65,126 10,98 10,32"
        fill="rgba(108,92,231,0.12)"
        stroke="#6C5CE7"
        strokeWidth="1.2"
      />
      {/* Hexágono interno */}
      <polygon
        points="65,18 105,40 105,90 65,112 25,90 25,40"
        fill="rgba(108,92,231,0.10)"
        stroke="rgba(108,92,231,0.25)"
        strokeWidth="0.5"
      />
      {/* Headset */}
      <path d="M45 66 A20 20 0 0 1 85 66" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
      <rect x="36" y="62" width="11" height="18" rx="5.5" fill="white" />
      <rect x="83" y="62" width="11" height="18" rx="5.5" fill="white" />
      {/* Haste + ponto do microfone */}
      <path d="M47 76 Q40 88 47 94" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="49" cy="95" r="4.5" fill="#00D2A0" />
    </svg>
  )
}

/**
 * Logo completo: marca + wordmark "HelpDesk" com "Desk" em destaque e o selo PRO.
 */
export function BrandLogo({
  className = '',
  markClassName = 'h-9 w-9',
  textClassName = 'text-lg',
}: {
  className?: string
  markClassName?: string
  textClassName?: string
}) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark className={markClassName} />
      <span
        className={`font-display font-bold leading-none tracking-tight text-white ${textClassName}`}
      >
        Help<span className="text-brand-400">Desk</span>
        <span className="ml-1.5 inline-block rounded-full bg-[#00D2A0] px-1.5 py-0.5 align-middle text-[9px] font-semibold tracking-widest text-[#04342C]">
          PRO
        </span>
      </span>
    </span>
  )
}
