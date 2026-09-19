import { Radio, WifiOff } from 'lucide-react'
import { VEHICLE_ICONS } from '../constants'
import type { InfraLink } from '../types'

interface ConnectivityLinkProps {
  item: InfraLink
  online: boolean
  /** Quantos veículos dependem deste enlace. */
  veiculosAfetados: number
  onToggle: () => void
}

export const ConnectivityLink = ({
  item,
  online,
  veiculosAfetados,
  onToggle,
}: ConnectivityLinkProps) => {
  const traffic = online ? 42 + ((item.id * 17) % 43) : 0

  return (
    <article
      className={`rounded-2xl border bg-noc-card p-4 shadow-xl shadow-black/10 transition sm:p-5 ${
        online ? 'border-slate-800' : 'border-red-500/40'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                online ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'
              }`}
            />
            <h3 className="truncate text-sm font-bold text-white">{item.tipo}</h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">{item.target}</p>
        </div>
        {online ? (
          <Radio size={19} aria-hidden className="shrink-0 text-emerald-400" />
        ) : (
          <WifiOff size={19} aria-hidden className="shrink-0 text-red-400" />
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
          <p className="text-[9px] uppercase tracking-widest text-slate-500">Latência</p>
          <p className={`mt-1 text-sm font-bold ${online ? 'text-slate-200' : 'text-red-400'}`}>
            {online ? item.latencia : 'TIMEOUT'}
          </p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
          <p className="text-[9px] uppercase tracking-widest text-slate-500">Status</p>
          <p className={`mt-1 text-sm font-bold ${online ? 'text-emerald-400' : 'text-red-400'}`}>
            {online ? 'ONLINE' : 'OFFLINE'}
          </p>
        </div>
      </div>

      {/* Quem depende deste enlace. É o que liga o card à frota: derrubar aqui
          tira exatamente estas categorias do ar. */}
      <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/50 p-3">
        <p className="text-[9px] uppercase tracking-widest text-slate-500">Atende</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {item.categorias.map((categoria) => (
            <span
              key={categoria}
              className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] ${
                online
                  ? 'border-slate-700 text-slate-300'
                  : 'border-red-500/30 text-red-400 line-through'
              }`}
            >
              <span aria-hidden>{VEHICLE_ICONS[categoria]}</span>
              {categoria}
            </span>
          ))}
        </div>
        <p className={`mt-2 text-[10px] ${online ? 'text-slate-500' : 'text-red-400'}`}>
          {online
            ? `${veiculosAfetados.toLocaleString('pt-BR')} veículos reportando`
            : `${veiculosAfetados.toLocaleString('pt-BR')} veículos sem telemetria`}
        </p>
      </div>

      <div className="mt-4">
        <div className="mb-1 flex justify-between text-[10px] text-slate-500">
          <span>Uso de banda</span>
          <span>{traffic}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-noc-accent transition-all" style={{ width: `${traffic}%` }} />
        </div>
      </div>

      <button
        type="button"
        onClick={onToggle}
        className={`mt-4 w-full rounded-lg border px-3 py-2 text-xs font-bold transition ${
          online
            ? 'border-slate-700 text-slate-300 hover:border-red-500/50 hover:text-red-300'
            : 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10'
        }`}
      >
        {online ? 'Simular queda do enlace' : 'Restaurar conexão'}
      </button>
    </article>
  )
}
