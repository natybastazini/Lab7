export type Variant = 'success' | 'warning' | 'danger'

export interface Vehicle {
  id: string
  modelo: string
  tipo: string
  vel: number
  latitude: number
  longitude: number
}

export interface InfraLink {
  id: number
  /** Identificador usado no estado dos links. Um por enlace físico. */
  chave: string
  tipo: string
  target: string
  latencia: string
  /** Categorias de veículo que dependem deste enlace para reportar telemetria. */
  categorias: string[]
}
