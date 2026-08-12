import { Calendar, Download, Search, SlidersHorizontal } from 'lucide-react';
import { RUTAS } from '../../data/seedData.js';

export default function TransporteFilters({ filtros, onChange, onExportar }) {
  const update = (patch) => onChange({ ...filtros, ...patch });

  return (
    <div className="animate-fade-in-up flex flex-wrap items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-3">
      <div className="relative min-w-[220px] flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={filtros.busqueda || ''}
          onChange={(e) => update({ busqueda: e.target.value })}
          placeholder="Buscar por lote_id… (debounce 300ms)"
          aria-label="Buscar por lote ID"
          className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-slate-500" />
        <select
          value={filtros.tipo || ''}
          onChange={(e) => update({ tipo: e.target.value })}
          aria-label="Filtrar por tipo de producto"
          className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-200 focus:border-sky-500 focus:outline-none"
        >
          <option value="">Todos los tipos</option>
          <option value="Fresco">Fresco</option>
          <option value="Congelado">Congelado</option>
        </select>

        <select
          value={filtros.ruta || ''}
          onChange={(e) => update({ ruta: e.target.value })}
          aria-label="Filtrar por ruta"
          className="max-w-[220px] rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-200 focus:border-sky-500 focus:outline-none"
        >
          <option value="">Todas las rutas</option>
          {RUTAS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-slate-500" />
        <input
          type="date"
          value={filtros.fechaIni || ''}
          onChange={(e) => update({ fechaIni: e.target.value })}
          aria-label="Fecha inicial"
          className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-200 focus:border-sky-500 focus:outline-none"
        />
        <span className="text-slate-600">–</span>
        <input
          type="date"
          value={filtros.fechaFin || ''}
          onChange={(e) => update({ fechaFin: e.target.value })}
          aria-label="Fecha final"
          className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-200 focus:border-sky-500 focus:outline-none"
        />
      </div>

      <button
        type="button"
        onClick={onExportar}
        className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-sky-400"
      >
        <Download className="h-4 w-4" />
        Exportar CSV
      </button>
    </div>
  );
}