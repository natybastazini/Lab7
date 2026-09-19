import type { InfraLink } from './types'

export const CATEGORIES = [
  'Ônibus',
  'Caminhão',
  'Moto',
  'Carro',
  'Caminhonete',
  'Van',
  'SUV',
  'Esportivo',
  'Trator',
  'Ambulância',
] as const

export const VEHICLE_ICONS: Record<string, string> = {
  'Ônibus': '🚌',
  'Caminhão': '🚚',
  'Moto': '🏍️',
  'Carro': '🚗',
  'Caminhonete': '🛻',
  'Van': '🚐',
  'SUV': '🚙',
  'Esportivo': '🏎️',
  'Trator': '🚜',
  'Ambulância': '🚑',
}

// Cada enlace atende duas categorias de veículo, e as dez categorias estão
// distribuídas entre os cinco enlaces. Derrubar qualquer link tira 20.000
// veículos do ar — é esta tabela que faz o painel inteiro conversar: os
// cartões de status, a distribuição por categoria, a tabela da frota e os
// incidentes leem todos daqui.
export const INFRASTRUCTURE: InfraLink[] = [
  {
    id: 1,
    chave: 'vsat-hub',
    tipo: 'VSAT — Hub Principal',
    target: 'Satélite Star One D2',
    latencia: '580ms',
    categorias: ['Carro', 'SUV'],
  },
  {
    id: 2,
    chave: 'vsat-bgan',
    tipo: 'VSAT — BGAN Backup',
    target: 'Satélite Inmarsat',
    latencia: '850ms',
    categorias: ['Caminhão', 'Caminhonete'],
  },
  {
    id: 3,
    chave: 'ospf',
    tipo: 'OSPF',
    target: 'Core Interno (10.0.0.1)',
    latencia: '2ms',
    categorias: ['Van', 'Trator'],
  },
  {
    id: 4,
    chave: 'bgp',
    tipo: 'BGP',
    target: 'Operadora AS-1042',
    latencia: '12ms',
    categorias: ['Ônibus', 'Esportivo'],
  },
  {
    id: 5,
    chave: 'lte',
    tipo: 'LTE Móvel',
    target: 'Antena Celular ERB',
    latencia: '45ms',
    categorias: ['Moto', 'Ambulância'],
  },
]

// Índice inverso: de qual enlace cada categoria depende. Montado a partir da
// tabela acima, para não existir uma segunda lista que possa sair de sincronia.
export const LINK_DA_CATEGORIA: Record<string, InfraLink> = Object.fromEntries(
  INFRASTRUCTURE.flatMap((link) => link.categorias.map((categoria) => [categoria, link])),
)

// Prefixo do identificador de cada categoria.
// Usar as duas primeiras letras do tipo, como na primeira versão, fazia
// Caminhão, Carro e Caminhonete virarem todos "CA" — 30.000 veículos com
// identificadores repetidos e chaves duplicadas no React.
export const VEHICLE_PREFIXES: Record<string, string> = {
  'Ônibus': 'ONI',
  'Caminhão': 'CAM',
  'Moto': 'MOT',
  'Carro': 'CAR',
  'Caminhonete': 'CNT',
  'Van': 'VAN',
  'SUV': 'SUV',
  'Esportivo': 'ESP',
  'Trator': 'TRT',
  'Ambulância': 'AMB',
}

export const VEHICLE_MODELS: Record<string, string> = {
  'Ônibus': 'Urban 2026',
  'Caminhão': 'Cargo 2429',
  'Moto': 'Street 160',
  'Carro': 'Sedan 2.0',
  'Caminhonete': 'Pickup 4x4',
  'Van': 'Transit',
  'SUV': 'Trail 2.0',
  'Esportivo': 'Sport GT',
  'Trator': 'Agro 180',
  'Ambulância': 'Rescue 4x4',
}
