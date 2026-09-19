import { lazy, Suspense, useState } from 'react'
import {
  Activity,
  BellRing,
  Bug,
  CarFront,
  Network,
  Pause,
  Play,
  Radio,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react'
import { CATEGORIES, INFRASTRUCTURE, LINK_DA_CATEGORIA, VEHICLE_ICONS } from './constants'
import { ErrorBoundary } from './components/ErrorBoundary'
import { FleetTable } from './components/FleetTable'
import { LinksCommunication } from './components/LinksCommunication'
import { StatusCard } from './components/StatusCard'
import { StatusClock } from './components/StatusClock'
import { SystemLogs } from './components/SystemLogs'
import { useFleetMonitor } from './hooks/useFleetMonitor'
import './index.css'

// O gráfico traz junto a biblioteca Recharts, que sozinha responde por cerca de
// 70% do JavaScript da página. Carregando sob demanda, o resto do painel
// aparece primeiro e o build deixa de avisar sobre o tamanho do pacote.
const TelemetryChart = lazy(() =>
  import('./components/TelemetryChart').then((modulo) => ({ default: modulo.TelemetryChart })),
)

// Componente que quebra de propósito. Serve para mostrar, na apresentação, que
// uma falha em um bloco não derruba o painel inteiro.
function SensorDefeituoso({ quebrado }: { quebrado: boolean }) {
  if (quebrado) {
    throw new Error('Leitura corrompida: telemetria.velocidade é undefined')
  }
  return null
}

function App() {
  const monitor = useFleetMonitor()
  const linksOnline = monitor.metrics.onlineLinks
  const [sensorQuebrado, setSensorQuebrado] = useState(false)

  const intervaloSegundos = Math.round(monitor.intervaloRevalidacao / 1000)


  return (
    <div className="min-h-screen bg-noc-bg text-slate-200">
      <header className="border-b border-slate-800/80 bg-slate-950/95">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          {/* Identificação do centro de operações. O LED verde pulsa enquanto
              o painel está recebendo telemetria; fica âmbar se algum enlace cai. */}
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={`led ${monitor.metrics.alerts ? 'led-alerta' : ''}`}
              role="img"
              aria-label={
                monitor.metrics.alerts ? 'Operação com alerta' : 'Operação normal'
              }
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <h2 className="text-sm font-black tracking-[0.14em] text-white sm:text-base">
                  NOC COMMAND CENTER
                </h2>
                <span aria-hidden className="text-slate-600">
                  |
                </span>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  Monitoramento de Frota
                </p>
              </div>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Big Data Telemetry Cluster • {monitor.metrics.alerts ? 'Degradado' : 'Online'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-blue-300">
              <CarFront size={14} aria-hidden />
              100.000 veículos rastreados
            </div>
            <div
              className={`flex items-center gap-2 rounded-full border px-3 py-2 text-[9px] font-bold uppercase tracking-wider ${
                monitor.metrics.alerts
                  ? 'border-amber-500/20 bg-amber-500/5 text-amber-300'
                  : 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300'
              }`}
            >
              <span
                aria-hidden
                className={`led led-sm ${monitor.metrics.alerts ? 'led-alerta' : ''}`}
              />
              {monitor.metrics.alerts
                ? `${monitor.metrics.alerts} enlace(s) em queda`
                : 'Sistema operacional (100%)'}
            </div>

            {/* Relógio com segundos e data, como num painel de operação */}
            <StatusClock />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] space-y-6 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <section>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">BIG DATA TELEMETRY • ARQUITETURA MODULAR</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Monitoramento de Frota
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                Visão operacional da frota, telemetria e conectividade em um único centro de
                monitoramento.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck size={15} aria-hidden className="text-emerald-400" />
              <span>
                Última coleta às{' '}
                {monitor.ultimaColeta.toLocaleTimeString('pt-BR')}
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-950/45 p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-300">
                Controle de simulação
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Dispare falhas em cascata para demonstrar a regra de resiliência do monitor.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Um botão por enlace, gerado a partir da tabela de
                  infraestrutura. Cada um derruba as categorias daquele link. */}
              {INFRASTRUCTURE.map((link) => {
                const online = monitor.linksStatus[link.chave]
                return (
                  <button
                    key={link.chave}
                    onClick={() => monitor.toggleLink(link.chave)}
                    className={`control-button ${online ? 'control-danger' : 'control-success'}`}
                    title={`${link.categorias.join(' e ')} — ${monitor
                      .veiculosPorLink(link.chave)
                      .toLocaleString('pt-BR')} veículos`}
                  >
                    <Radio size={13} aria-hidden />{' '}
                    {online ? `Derrubar ${link.tipo}` : `Restaurar ${link.tipo}`}
                  </button>
                )
              })}
              <button
                onClick={() => setSensorQuebrado((quebrado) => !quebrado)}
                className="control-button control-danger"
              >
                <Bug size={13} aria-hidden />{' '}
                {sensorQuebrado ? 'Restaurar sensor' : 'Corromper sensor'}
              </button>
              <button onClick={monitor.restaurarTodos} className="control-button control-success">
                <RotateCcw size={13} aria-hidden /> Restaurar todos (
                {Math.round((linksOnline / monitor.metrics.totalLinks) * 100)}%)
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-800 pt-4">
            <p className="mr-auto text-xs text-slate-500">
              Revalidação automática da telemetria a cada {intervaloSegundos}s.
            </p>
            <button onClick={monitor.revalidarAgora} className="control-button">
              <RefreshCw size={13} aria-hidden /> Revalidar agora
            </button>
            <button
              onClick={monitor.alternarRevalidacao}
              className={`control-button ${monitor.revalidando ? '' : 'control-success'}`}
            >
              {monitor.revalidando ? (
                <>
                  <Pause size={13} aria-hidden /> Pausar revalidação
                </>
              ) : (
                <>
                  <Play size={13} aria-hidden /> Retomar revalidação
                </>
              )}
            </button>
          </div>
        </section>

        {/* A falha simulada acontece dentro de um boundary: o resto da página
            continua de pé. A key remonta o boundary ao restaurar o sensor. */}
        <ErrorBoundary area="sensor de telemetria" key={sensorQuebrado ? 'quebrado' : 'normal'}>
          <SensorDefeituoso quebrado={sensorQuebrado} />
        </ErrorBoundary>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatusCard
            label="Veículos rastreados"
            value="100.000"
            subtext="10 categorias monitoradas"
            icon={CarFront}
            variant="success"
          />
          <StatusCard
            label="Veículos online"
            value={monitor.metrics.onlineVehicles.toLocaleString('pt-BR')}
            subtext={
              monitor.metrics.offlineVehicles
                ? `${monitor.metrics.offlineVehicles.toLocaleString('pt-BR')} sem telemetria por queda de enlace`
                : '100% da frota com telemetria ativa'
            }
            icon={Activity}
            variant={monitor.metrics.onlineVehicles < 100000 ? 'warning' : 'success'}
          />
          <StatusCard
            label="Links de telecom"
            value={`${linksOnline} / ${monitor.metrics.totalLinks}`}
            subtext={`${monitor.metrics.alerts} link(s) em contingência/queda`}
            icon={Network}
            variant={monitor.metrics.alerts ? 'warning' : 'success'}
          />
          <StatusCard
            label="Alertas de frota"
            value={monitor.metrics.alerts}
            subtext={
              monitor.metrics.alerts ? 'Falhas de sinal & anomalias' : 'Nenhuma falha detectada'
            }
            icon={BellRing}
            variant={monitor.metrics.alerts ? 'danger' : 'success'}
          />
        </section>

        <ErrorBoundary area="telemetria">
          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
            <Suspense
              fallback={
                <section className="grid min-h-[340px] place-items-center rounded-2xl border border-slate-800 bg-noc-card text-xs text-slate-500">
                  Carregando o gráfico de telemetria...
                </section>
              }
            >
              <TelemetryChart
                averageSpeed={monitor.metrics.avgSpeed}
                sampleSize={monitor.metrics.onlineVehicles}
                historico={monitor.historico}
                intervaloSegundos={intervaloSegundos}
              />
            </Suspense>

            <section className="rounded-2xl border border-slate-800 bg-noc-card p-5 shadow-xl shadow-black/10">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="eyebrow">Distribuição</p>
                  <h2 className="mt-1 text-lg font-bold text-white">Categorias da frota</h2>
                  <p className="mt-1 text-xs text-slate-500">10.000 veículos por categoria</p>
                </div>
                <CarFront size={22} aria-hidden className="text-slate-700" />
              </div>
              <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {CATEGORIES.map((category) => {
                  const online = monitor.isCategoryOnline(category)
                  const link = LINK_DA_CATEGORIA[category]
                  return (
                    <div
                      key={category}
                      className={`rounded-lg border px-3 py-2.5 ${
                        online ? 'border-slate-800 bg-slate-950/40' : 'border-red-500/30 bg-red-500/5'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-xs text-slate-300">
                          <span aria-hidden className="mr-1.5">
                            {VEHICLE_ICONS[category]}
                          </span>
                          {category}
                        </span>
                        <span
                          className={`text-[9px] font-bold ${online ? 'text-slate-500' : 'text-red-400'}`}
                        >
                          {online ? '10K' : 'OFF'}
                        </span>
                      </div>
                      {/* Qual enlace sustenta esta categoria */}
                      <p
                        className={`mt-0.5 truncate text-[9px] ${online ? 'text-slate-500' : 'text-red-400'}`}
                      >
                        via {link?.tipo ?? '—'}
                      </p>
                    </div>
                  )
                })}
              </div>
            </section>
          </section>
        </ErrorBoundary>

        <ErrorBoundary area="links de comunicação">
          <LinksCommunication
            links={INFRASTRUCTURE}
            linksStatus={monitor.linksStatus}
            veiculosPorLink={monitor.veiculosPorLink}
            toggleLink={monitor.toggleLink}
          />
        </ErrorBoundary>

        <ErrorBoundary area="tabela da frota">
          <FleetTable vehicles={monitor.fleet} isCategoryOnline={monitor.isCategoryOnline} />
        </ErrorBoundary>

        <ErrorBoundary area="logs de sistema">
          <SystemLogs
            linksStatus={monitor.linksStatus}
            totalVeiculos={monitor.metrics.totalVehicles}
            veiculosPorLink={monitor.veiculosPorLink}
          />
        </ErrorBoundary>

        <footer className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>React + TypeScript → Componentes tipados → Custom Hook → Tailwind CSS</span>
          <span className="text-slate-500">Observabilidade OTel • TraceID no console</span>
        </footer>
      </main>
    </div>
  )
}

export default App
