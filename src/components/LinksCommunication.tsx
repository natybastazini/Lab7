import { Network } from 'lucide-react'
import type { InfraLink } from '../types'
import { ConnectivityLink } from './ConnectivityLink'

interface Props {
  links: InfraLink[]
  linksStatus: Record<string, boolean>
  veiculosPorLink: (chave: string) => number
  toggleLink: (chave: string) => void
}

export const LinksCommunication = ({ links, linksStatus, veiculosPorLink, toggleLink }: Props) => (
  <section>
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <p className="eyebrow">Conectividade</p>
        <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">Links de comunicação</h2>
        <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm">
          Cada enlace atende duas categorias da frota. Derrubar qualquer um deles tira 20.000
          veículos do ar, e o painel inteiro reage: cartões, distribuição, tabela e incidentes.
        </p>
      </div>
      <Network aria-hidden className="hidden shrink-0 text-slate-700 sm:block" size={30} />
    </div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {links.map((item) => (
        <ConnectivityLink
          key={item.chave}
          item={item}
          online={linksStatus[item.chave] ?? true}
          veiculosAfetados={veiculosPorLink(item.chave)}
          onToggle={() => toggleLink(item.chave)}
        />
      ))}
    </div>
  </section>
)
