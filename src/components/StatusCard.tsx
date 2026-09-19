import type { LucideIcon } from 'lucide-react'
import type { Variant } from '../types'
import { cn } from '../utils'

interface StatusCardProps {
  label: string
  value: string | number
  subtext: string
  icon: LucideIcon
  variant: Variant
}

export const StatusCard = ({ label, value, subtext, icon: Icon, variant }: StatusCardProps) => {
  const styles = {
    success: { icon: 'text-emerald-400', badge: 'bg-emerald-400/10 text-emerald-300', label: 'ESTÁVEL' },
    warning: { icon: 'text-amber-400', badge: 'bg-amber-400/10 text-amber-300', label: 'ATENÇÃO' },
    danger: { icon: 'text-red-400', badge: 'bg-red-400/10 text-red-300', label: 'ALERTA' },
  }[variant]

  return (
    <article className="group rounded-2xl border border-slate-800 bg-noc-card p-5 shadow-xl shadow-black/10 transition hover:border-slate-700">
      <div className="flex items-start justify-between gap-4">
        <div className="grid h-11 w-11 place-items-center rounded-xl border border-slate-700 bg-slate-950/70">
          <Icon size={21} className={styles.icon} />
        </div>
        <span className={cn('rounded-full px-2.5 py-1 text-[9px] font-bold tracking-wider', styles.badge)}>{styles.label}</span>
      </div>
      <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{subtext}</p>
    </article>
  )
}
