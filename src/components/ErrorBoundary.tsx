import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertOctagon } from 'lucide-react'

interface Props {
  area: string
  children: ReactNode
}

interface State {
  erro: Error | null
}

// Error Boundary: a rede de segurança da interface.
//
// Sem ela, um erro em qualquer componente derruba a árvore inteira do React e
// o usuário fica com a tela em branco. Num centro de operações isso é grave:
// um dado corrompido no gráfico apagaria também os links de comunicação, que
// estão funcionando.
//
// Precisa ser classe: getDerivedStateFromError e componentDidCatch não têm
// equivalente em hooks até hoje. É a única classe do projeto.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { erro: null }

  static getDerivedStateFromError(erro: Error): State {
    return { erro }
  }

  componentDidCatch(erro: Error, info: ErrorInfo): void {
    // Num projeto real, aqui o erro seria enviado para uma ferramenta de
    // monitoramento (Sentry, Datadog). Por ora, vai para o console.
    console.error(`[ErrorBoundary: ${this.props.area}]`, erro, info.componentStack)
  }

  private tentarNovamente = () => this.setState({ erro: null })

  render() {
    const { erro } = this.state
    if (!erro) return this.props.children

    return (
      <section
        role="alert"
        className="rounded-2xl border border-red-500/40 bg-noc-card p-5 shadow-xl shadow-black/10"
      >
        <div className="flex items-start gap-3">
          <AlertOctagon size={20} className="mt-0.5 shrink-0 text-red-400" />
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-white">Falha em {this.props.area}</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Este bloco parou, mas o restante do painel continua operacional.
            </p>
            <p className="mt-2 break-words font-mono text-[11px] text-amber-400">{erro.message}</p>
            <button
              type="button"
              onClick={this.tentarNovamente}
              className="control-button mt-3"
            >
              Tentar montar de novo
            </button>
          </div>
        </div>
      </section>
    )
  }
}
