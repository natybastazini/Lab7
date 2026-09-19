// Observabilidade — Distributed Tracing no padrão W3C Trace Context.
//
// A referência do laboratório imprimia um TraceID solto com Math.random().
// Aqui o identificador segue o formato que o OpenTelemetry usa de verdade:
//
//   traceparent: 00-<trace-id 32 hex>-<span-id 16 hex>-01
//                 |         |              |            |
//              versão   id do trace    id do span    amostrado
//
// Cada ciclo de telemetria abre um trace; cada etapa dentro dele é um span.
// Assim o log do console fica igual ao que um coletor esperaria receber, e
// trocar por `@opentelemetry/sdk-trace-web` depois não muda o formato.

const NOME_SERVICO = 'noc-command-center'

// Endereço do coletor (OTLP/HTTP). Vem de variável de ambiente: em branco,
// os spans ficam só no console.
const COLETOR = import.meta.env.VITE_OTEL_EXPORTER_URL ?? ''

export interface Span {
  traceId: string
  spanId: string
  parentId?: string
  nome: string
  duracaoMs: number
  atributos: Record<string, string | number>
}

type Ouvinte = (spans: Span[]) => void

const spans: Span[] = []
const ouvintes = new Set<Ouvinte>()

function idHex(bytes: number): string {
  const valores = new Uint8Array(bytes)
  crypto.getRandomValues(valores)
  return Array.from(valores, (b) => b.toString(16).padStart(2, '0')).join('')
}

export function observarSpans(ouvinte: Ouvinte): () => void {
  ouvintes.add(ouvinte)
  ouvinte([...spans])
  return () => {
    ouvintes.delete(ouvinte)
  }
}

function exportar(span: Span): void {
  console.log(
    `[OTel] traceparent: 00-${span.traceId}-${span.spanId}-01 | ${span.nome} | ` +
      `${span.duracaoMs.toFixed(1)}ms | ${JSON.stringify(span.atributos)}`,
  )

  if (!COLETOR) return

  // Corpo OTLP/JSON, o formato que um coletor do OpenTelemetry aceita
  const agora = Date.now() * 1e6
  void fetch(COLETOR, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    body: JSON.stringify({
      resourceSpans: [
        {
          resource: {
            attributes: [{ key: 'service.name', value: { stringValue: NOME_SERVICO } }],
          },
          scopeSpans: [
            {
              scope: { name: 'noc-tracing', version: '1.0.0' },
              spans: [
                {
                  traceId: span.traceId,
                  spanId: span.spanId,
                  parentSpanId: span.parentId,
                  name: span.nome,
                  kind: 1,
                  startTimeUnixNano: String(Math.round(agora - span.duracaoMs * 1e6)),
                  endTimeUnixNano: String(Math.round(agora)),
                  attributes: Object.entries(span.atributos).map(([key, value]) => ({
                    key,
                    value:
                      typeof value === 'number'
                        ? { intValue: value }
                        : { stringValue: String(value) },
                  })),
                },
              ],
            },
          ],
        },
      ],
    }),
    // Um coletor fora do ar nunca pode derrubar a aplicação que ele observa
  }).catch(() => undefined)
}

/** Abre um trace novo e devolve uma função que registra spans dentro dele. */
export function iniciarTrace(nomeDaOperacao: string) {
  const traceId = idHex(16)
  const parentId = idHex(8)

  return {
    traceId,
    parentId,
    registrar(nome: string, duracaoMs: number, atributos: Record<string, string | number> = {}) {
      const span: Span = {
        traceId,
        spanId: idHex(8),
        parentId,
        nome: `${nomeDaOperacao}.${nome}`,
        duracaoMs,
        atributos,
      }

      spans.unshift(span)
      if (spans.length > 40) spans.length = 40 // o histórico não cresce sem fim
      ouvintes.forEach((ouvinte) => ouvinte([...spans]))
      exportar(span)
      return span
    },
  }
}

export const coletorConfigurado = Boolean(COLETOR)
