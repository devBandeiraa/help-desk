import { LucideIcon } from 'lucide-react'

interface Props {
  label: string
  value: number | string
  icon: LucideIcon
  color: string
}

export function StatCard({ label, value, icon: Icon, color }: Props) {
  return (
    <div className="panel group p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-400/30">
      <div className="flex items-center justify-between">
        <span className="text-sm text-mist-200">{label}</span>
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-2 font-display text-3xl font-bold text-white">{value}</p>
    </div>
  )
}
