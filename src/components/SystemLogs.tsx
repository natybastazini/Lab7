import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Terminal } from 'lucide-react'
import { INFRASTRUCTURE } from '../constants'
import { observarSpans, type Span } from '../observability/tracing'

interface SystemLogsProps {
  linksStatus: Record<string, boolean>
  totalVeiculos: number
  veiculosPorLink: (chave: string) => number
}

export function SystemLogs({ linksStatus, totalVeiculos, veiculosPorLink }: SystemLogsProps) {
  // Os spans vêm do módulo de observabilidade: são os mesmos que aparecem no
  // console do navegador. Antes esta lista era um texto fixo com horários
  // congelados, o que contradizia o selo "LIVE" ao lado.
  const [spans, setSpans] = useState<Span[]>([])
  useEffect(() => observarSpans(setSpans), [])

  // Os incidentes são derivados do estado real dos enlaces, não de uma lista fixa
  const quedas = INFRASTRUCTURE.filter((link) => !linksStatus[link.chave])

  const incidentes = quedas.length
    ? quedas.map((link) => ({
        chave: link.chave,
        severidade: link.tipo.startsWith('VSAT') ? 'ALTO' : 'MÉDIO',
        titulo: `Perda de enlace — ${link.tipo}`,
        detalhe:
          `Sem resposta de ${link.target}. As categorias ${link.categorias.join(' e ')} ficam ` +
          `sem telemetria: ${veiculosPorLink(link.chave).toLocaleString('pt-BR')} veículos afetados.`,
        status: 'EM ANDAMENTO',
      }))
    : [
        {
          chave: 'estavel',
          severidade: 'INFO',
          titulo: 'Nenhum incidente aberto',
          detalhe: `Os ${INFRASTRUCTURE.length} enlaces respondem dentro do limite e os ${totalVeiculos.toLocaleString('pt-BR')} veículos reportam telemetria.`,
          status: 'ESTÁVEL',
        },
      ]

  return (
    <section className="grid gap-5 xl:grid-cols-[1.05fr_1.4fr]">
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-noc-card shadow-xl shadow-black/10">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <p className="eyebrow">Eventos operacionais</p>
            <h2 className="mt-1 text-lg font-bold text-white">Incidentes de frota</h2>
          </div>
          <span
            className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${
              quedas.length
                ? 'border-red-500/20 bg-red-500/5 text-red-300'
                : 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300'
            }`}
          >
            {quedas.length} {quedas.length === 1 ? 'evento' : 'eventos'}
          </span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {incidentes.map((incidente) => (
            <div key={incidente.chave} className="px-5 py-4">
              <div className="flex gap-3">
                {incidente.severidade === 'INFO' ? (
                  <CheckCircle2 size={17} aria-hidden className="mt-0.5 shrink-0 text-emerald-400" />
                ) : (
                  <AlertTriangle size={17} aria-hidden className="mt-0.5 shrink-0 text-amber-400" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[8px] font-black ${
                        incidente.severidade === 'ALTO'
                          ? 'bg-red-500/10 text-red-400'
                          : incidente.severidade === 'MÉDIO'
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-emerald-500/10 text-emerald-400'
                      }`}
                    >
                      {incidente.severidade}
                    </span>
                    <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500">
                      {incidente.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-slate-200">{incidente.titulo}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{incidente.detalhe}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#050b14] shadow-xl shadow-black/10">
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/70 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-400">
              <Terminal size={15} aria-hidden />
            </div>
            <div>
              <p className="eyebrow">System output</p>
              <h2 className="mt-1 text-lg font-bold text-white">
                Spans do tracing <span className="text-slate-500">(W3C Trace Context)</span>
              </h2>
            </div>
          </div>
          <span className="flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-wider text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> LIVE
          </span>
        </div>

        <div className="p-4 sm:p-5">
          <div className="min-h-[250px] overflow-x-auto rounded-xl border border-slate-800 bg-black/40 p-4 font-mono text-[10px] leading-6 text-slate-500 sm:text-[11px]">
            {spans.length === 0 ? (
              <div>› aguardando a primeira coleta de telemetria...</div>
            ) : (
              spans.map((span) => (
                <div key={span.spanId} className="whitespace-nowrap">
                  <span aria-hidden className="mr-2 text-slate-600">
                    ›
                  </span>
                  <span className="text-blue-300">[OTel]</span>{' '}
                  <span className="text-slate-600">trace</span> {span.traceId.slice(0, 16)}…{' '}
                  <span className="text-slate-600">span</span> {span.spanId} {span.nome}{' '}
                  <span className={span.atributos['links.alerts'] ? 'text-amber-400' : 'text-emerald-400'}>
                    {span.atributos['links.online']}/{INFRASTRUCTURE.length} links
                  </span>{' '}
                  <span className={span.atributos['fleet.offline'] ? 'text-amber-400' : ''}>
                    {Number(span.atributos['fleet.online']).toLocaleString('pt-BR')} online
                  </span>{' '}
                  {span.atributos['fleet.avg_speed_kmh']} km/h
                </div>
              ))
            )}
            <div className="mt-2 flex items-center gap-1 text-emerald-400">
              <span aria-hidden>›</span>
              <span className="cursor-blink">_</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
