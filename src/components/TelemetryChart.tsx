import { Activity, Gauge } from 'lucide-react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { PontoTelemetria } from '../hooks/useFleetMonitor'

interface TelemetryChartProps {
  averageSpeed: number
  sampleSize: number
  /** Leituras já coletadas. O gráfico mostra dados reais, não uma curva fixa. */
  historico: PontoTelemetria[]
  intervaloSegundos: number
}

export const TelemetryChart = ({
  averageSpeed,
  sampleSize,
  historico,
  intervaloSegundos,
}: TelemetryChartProps) => (
  <section className="rounded-2xl border border-slate-800 bg-noc-card p-4 shadow-xl shadow-black/10 sm:p-5">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <Activity size={18} aria-hidden className="text-noc-accent" />
          <h2 className="font-semibold text-white">Velocidade média</h2>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Telemetria da frota • {sampleSize.toLocaleString('pt-BR')} veículos online • leitura a
          cada {intervaloSegundos}s
        </p>
      </div>
      <div className="flex items-center gap-2 self-start rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2 text-blue-300 sm:self-auto">
        <Gauge size={17} aria-hidden />
        <strong>{averageSpeed} km/h</strong>
      </div>
    </div>

    <div className="mt-4 h-56 w-full sm:h-64">
      {historico.length < 2 ? (
        <div className="grid h-full place-items-center text-xs text-slate-500">
          Coletando leituras da frota...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={historico} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ stroke: '#334155' }}
              contentStyle={{
                background: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: 10,
                color: '#e2e8f0',
              }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Line
              type="monotone"
              dataKey="velocidade"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ r: 2, fill: '#3b82f6' }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  </section>
)
