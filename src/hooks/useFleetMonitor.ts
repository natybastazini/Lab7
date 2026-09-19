import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  CATEGORIES,
  INFRASTRUCTURE,
  LINK_DA_CATEGORIA,
  VEHICLE_MODELS,
  VEHICLE_PREFIXES,
} from '../constants'
import { iniciarTrace } from '../observability/tracing'
import type { Vehicle } from '../types'

const TOTAL_VEHICLES = 100_000
const VEHICLES_PER_CATEGORY = 10_000

// Intervalo da revalidação automática da telemetria, em milissegundos.
// Vem de variável de ambiente para mudar por ambiente sem tocar no código
// (é o refetchInterval do checklist de auditoria do laboratório).
const INTERVALO_REVALIDACAO = Number(import.meta.env.VITE_REFRESH_MS ?? 5_000)

// Todos os enlaces começam no ar. O estado nasce da própria tabela de
// infraestrutura, então adicionar um link novo não exige mexer aqui.
const ESTADO_INICIAL_DOS_LINKS = Object.fromEntries(
  INFRASTRUCTURE.map((link) => [link.chave, true]),
) as Record<string, boolean>

function createFleet(): Vehicle[] {
  return CATEGORIES.flatMap((tipo, categoryIndex) =>
    Array.from({ length: VEHICLES_PER_CATEGORY }, (_, index) => ({
      id: `${VEHICLE_PREFIXES[tipo]}-${String(index + 1).padStart(5, '0')}`,
      modelo: VEHICLE_MODELS[tipo],
      tipo,
      vel: 25 + ((index * 17 + categoryIndex * 11) % 86),
      latitude: -23.45 + ((index % 100) * 0.0007) + categoryIndex * 0.002,
      longitude: -46.75 + ((index % 100) * 0.0008) + categoryIndex * 0.002,
    })),
  )
}

export interface PontoTelemetria {
  time: string
  velocidade: number
}

export const useFleetMonitor = () => {
  const [fleet] = useState<Vehicle[]>(createFleet)
  const [linksStatus, setLinksStatus] = useState<Record<string, boolean>>(ESTADO_INICIAL_DOS_LINKS)

  // Cada ciclo é uma releitura da telemetria. A frota fica em memória, mas as
  // velocidades oscilam a cada ciclo, como aconteceria com dados reais.
  const [ciclo, setCiclo] = useState(0)
  const [revalidando, setRevalidando] = useState(true)
  const [historico, setHistorico] = useState<PontoTelemetria[]>([])
  const [ultimaColeta, setUltimaColeta] = useState<Date>(() => new Date())

  // Regra de dependência do laboratório: cada categoria de veículo reporta
  // telemetria por um enlace. Se aquele enlace cai, a categoria inteira fica
  // offline. A tabela em constants.ts é a única fonte dessa relação.
  const isCategoryOnline = useCallback(
    (category: string) => {
      const link = LINK_DA_CATEGORIA[category]
      if (!link) return true
      return linksStatus[link.chave] ?? true
    },
    [linksStatus],
  )

  /** Quantos veículos a queda deste enlace tira do ar. */
  const veiculosPorLink = useCallback(
    (chave: string) => {
      const link = INFRASTRUCTURE.find((item) => item.chave === chave)
      return (link?.categorias.length ?? 0) * VEHICLES_PER_CATEGORY
    },
    [],
  )

  const metrics = useMemo(() => {
    // Uma passada só sobre os 100.000 registros. O filter + reduce da versão
    // anterior criava um array intermediário de 100 mil posições a cada
    // recálculo, e isso aparecia como travamento na auditoria de performance.
    const desvio = ((ciclo * 7) % 11) - 5
    let online = 0
    let somaVelocidade = 0

    for (const veiculo of fleet) {
      if (!isCategoryOnline(veiculo.tipo)) continue
      online += 1
      somaVelocidade += veiculo.vel
    }

    const avgSpeed = online ? Math.max(0, Math.round(somaVelocidade / online) + desvio) : 0

    const onlineLinks = INFRASTRUCTURE.filter((link) => linksStatus[link.chave]).length
    const alerts = INFRASTRUCTURE.length - onlineLinks

    return {
      totalVehicles: TOTAL_VEHICLES,
      onlineVehicles: online,
      offlineVehicles: TOTAL_VEHICLES - online,
      onlineLinks,
      totalLinks: INFRASTRUCTURE.length,
      alerts,
      avgSpeed,
      uptime: alerts > 0 ? '99.82%' : '99.99%',
    }
  }, [fleet, isCategoryOnline, linksStatus, ciclo])

  const toggleLink = useCallback((chave: string) => {
    setLinksStatus((previous) => ({ ...previous, [chave]: !previous[chave] }))
  }, [])

  const restaurarTodos = useCallback(() => setLinksStatus(ESTADO_INICIAL_DOS_LINKS), [])

  const alternarRevalidacao = useCallback(() => setRevalidando((ativa) => !ativa), [])

  const revalidarAgora = useCallback(() => setCiclo((atual) => atual + 1), [])

  // Revalidação automática: busca a telemetria de novo a cada intervalo.
  useEffect(() => {
    if (!revalidando) return
    const relogio = setInterval(revalidarAgora, INTERVALO_REVALIDACAO)
    return () => clearInterval(relogio)
  }, [revalidando, revalidarAgora])

  // Uma segunda leitura logo após abrir a página. Com uma leitura só o gráfico
  // não tem dois pontos para ligar e ficaria vazio até o primeiro intervalo.
  useEffect(() => {
    const aquecimento = setTimeout(revalidarAgora, 800)
    return () => clearTimeout(aquecimento)
  }, [revalidarAgora])

  // Guarda o histórico que alimenta o gráfico e emite os spans do trace.
  // Dispara a cada ciclo do relógio e também quando um link cai ou volta,
  // porque nesses dois casos a telemetria mudou de verdade.
  // O ref evita que o StrictMode registre a mesma leitura duas vezes.
  const ultimaLeitura = useRef('')

  useEffect(() => {
    const chave = `${ciclo}:${metrics.avgSpeed}:${metrics.onlineVehicles}:${metrics.alerts}`
    if (ultimaLeitura.current === chave) return
    ultimaLeitura.current = chave

    const inicio = performance.now()
    const agora = new Date()

    setHistorico((anterior) =>
      [
        ...anterior,
        {
          time: agora.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          velocidade: metrics.avgSpeed,
        },
      ].slice(-12),
    )
    setUltimaColeta(agora)

    const trace = iniciarTrace('telemetria')
    trace.registrar('coleta', performance.now() - inicio, {
      'fleet.total': metrics.totalVehicles,
      'fleet.online': metrics.onlineVehicles,
      'fleet.offline': metrics.offlineVehicles,
      'fleet.avg_speed_kmh': metrics.avgSpeed,
      'links.online': metrics.onlineLinks,
      'links.alerts': metrics.alerts,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ciclo, metrics.avgSpeed, metrics.onlineVehicles, metrics.alerts])

  return {
    fleet,
    linksStatus,
    metrics,
    historico,
    ultimaColeta,
    revalidando,
    intervaloRevalidacao: INTERVALO_REVALIDACAO,
    veiculosPorCategoria: VEHICLES_PER_CATEGORY,
    isCategoryOnline,
    veiculosPorLink,
    toggleLink,
    restaurarTodos,
    alternarRevalidacao,
    revalidarAgora,
  }
}
