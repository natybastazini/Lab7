import { Activity, MapPin } from 'lucide-react'
import type { Vehicle } from '../types'
import { CATEGORIES, LINK_DA_CATEGORIA, VEHICLE_ICONS } from '../constants'

interface FleetTableProps {
  vehicles: Vehicle[]
  isCategoryOnline: (category: string) => boolean
}

export const FleetTable = ({ vehicles, isCategoryOnline }: FleetTableProps) => {
  // Mostra representantes de todas as 10 categorias, em vez de apenas os
  // primeiros registros (que pertencem todos à categoria Ônibus).
  const visibleVehicles = CATEGORIES.map((category) =>
    vehicles.find((vehicle) => vehicle.tipo === category),
  ).filter(Boolean) as Vehicle[]

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-noc-card shadow-xl shadow-black/10">
      <div className="flex flex-col gap-3 border-b border-slate-800 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <div className="flex items-center gap-2">
            <Activity size={17} className="text-noc-accent" />
            <h2 className="font-semibold text-white">Frota monitorada por categoria</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">Amostra operacional das 10 categorias da frota.</p>
        </div>
        <span className="w-fit rounded-md border border-blue-500/20 bg-blue-500/5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-blue-300">10 categorias</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-slate-950/70 text-[9px] uppercase tracking-widest text-slate-500">
            <tr>
              <th className="px-4 py-3 sm:px-5">ID</th>
              <th className="px-4 py-3 sm:px-5">Categoria</th>
              <th className="px-4 py-3 sm:px-5">Modelo</th>
              <th className="px-4 py-3 sm:px-5">Velocidade</th>
              <th className="px-4 py-3 sm:px-5">Enlace</th>
              <th className="px-4 py-3 sm:px-5">Localização</th>
              <th className="px-4 py-3 sm:px-5">Status</th>
            </tr>
          </thead>
          <tbody>
            {visibleVehicles.map((vehicle) => {
              const online = isCategoryOnline(vehicle.tipo)
              return (
                <tr key={vehicle.id} className="border-t border-slate-800/80 hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-mono text-[10px] font-bold text-cyan-400 sm:px-5">{vehicle.id}</td>
                  <td className="px-4 py-3 sm:px-5">
                    <span className="mr-2">{VEHICLE_ICONS[vehicle.tipo]}</span>
                    <span className="text-slate-200">{vehicle.tipo}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400 sm:px-5">{vehicle.modelo}</td>
                  <td className="px-4 py-3 text-xs text-slate-300 sm:px-5">{vehicle.vel} km/h</td>
                  {/* De qual enlace esta categoria depende. É a coluna que
                      explica por que a linha ficou OFFLINE. */}
                  <td className="px-4 py-3 text-xs sm:px-5">
                    <span className={online ? 'text-slate-400' : 'text-red-400'}>
                      {LINK_DA_CATEGORIA[vehicle.tipo]?.tipo ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] text-slate-500 sm:px-5">{vehicle.latitude.toFixed(4)}, {vehicle.longitude.toFixed(4)}</td>
                  <td className="px-4 py-3 sm:px-5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[9px] font-bold ${online ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${online ? 'bg-emerald-400' : 'bg-red-400'}`} />
                      {online ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2 border-t border-slate-800 px-4 py-3 text-[10px] text-slate-500 sm:px-5">
        <MapPin size={13} />
        <span>Uma categoria por linha. A coluna Enlace mostra de qual link a categoria depende.</span>
      </div>
    </section>
  )
}
