import { Link2 } from 'lucide-react';
import DataTable from '../common/DataTable.jsx';
import StatusBadge from '../common/StatusBadge.jsx';
import HashDisplay from '../common/HashDisplay.jsx';
import { getNormativa } from '../../utils/validators.js';

export default function DosificacionTable({ dosificaciones = [], onVerCadena }) {
  const columns = [
    {
      key: 'lote_id',
      label: 'Lote ID',
      cellClassName: 'font-semibold',
      render: (row) => <span className="font-mono text-xs text-sky-400">{row.lote_id}</span>,
    },
    {
      key: 'normativa_destino',
      label: 'Mercado destino',
      render: (row) => <span className="text-slate-300">{row.normativa_destino}</span>,
    },
    {
      key: 'concentracion_ppm',
      label: 'Concentración',
      render: (row) => {
        const limite = getNormativa(row.normativa_destino).limite_ppm;
        const rojo = row.concentracion_ppm > limite;
        return <span className={`font-bold ${rojo ? 'text-red-400' : 'text-slate-200'}`}>{row.concentracion_ppm} ppm</span>;
      },
    },
    {
      key: 'so2_residual_ppm',
      label: 'SO₂ residual',
      render: (row) => <span className="text-slate-300">{row.so2_residual_ppm} ppm</span>,
    },
    {
      key: 'estado_validacion',
      label: 'Estado',
      render: (row) => {
        if (row.estado_validacion === 'APROBADO') return <StatusBadge status="aprobado" />;
        if (row.estado_validacion === 'ALERTA') return <StatusBadge status="alerta" />;
        return <StatusBadge status="critico" />;
      },
    },
    {
      key: 'operario_nombre',
      label: 'Operario',
      render: (row) => (
        <span className="text-slate-300">
          {row.operario_id} {row.operario_nombre}
        </span>
      ),
    },
    {
      key: 'riesgo_financiero_usd',
      label: 'Riesgo USD',
      cellClassName: 'font-bold',
      render: (row) => {
        if (row.riesgo_financiero_usd <= 0) return <span className="text-green-500">$0</span>;
        const severo = row.riesgo_financiero_usd >= row.peso_lote_kg * 8.5;
        return <span className={severo ? 'text-red-400' : 'text-amber-400'}>${row.riesgo_financiero_usd.toLocaleString()}</span>;
      },
    },
    {
      key: 'hash',
      label: 'Hash',
      render: (row) => (
        <div className="flex items-center gap-2">
          <HashDisplay hash={row.bloque_hash} />
          <button
            type="button"
            aria-label={`Ver cadena de ${row.lote_id}`}
            onClick={() => onVerCadena?.(row.lote_id)}
            className="inline-flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-[11px] font-bold text-amber-400 transition-colors hover:bg-amber-500/20"
          >
            <Link2 className="h-3 w-3" />
            Ver cadena
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable columns={columns} rows={dosificaciones} pageSize={5} emptyMessage="Sin registros de dosificación." />
  );
}