import { ShieldCheck } from 'lucide-react';
import DataTable from '../common/DataTable.jsx';
import StatusBadge from '../common/StatusBadge.jsx';
import HashDisplay from '../common/HashDisplay.jsx';

function tempEnRojo(temperatura, tipoProducto) {
  const limite = tipoProducto === 'Congelado' ? -18 : 4;
  return temperatura > limite;
}

export default function TransporteTable({ transportes = [], onVerificar }) {
  const columns = [
    {
      key: 'lote_id',
      label: 'Lote ID',
      cellClassName: 'font-semibold text-slate-100',
      render: (row) => (
        <span className="font-mono text-xs text-sky-400">{row.lote_id}</span>
      ),
    },
    {
      key: 'tipo_producto',
      label: 'Tipo',
      render: (row) => (
        <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${row.tipo_producto === 'Congelado' ? 'bg-sky-500/10 text-sky-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
          {row.tipo_producto}
        </span>
      ),
    },
    {
      key: 'temperatura_inicial_c',
      label: 'Temp. inicial',
      render: (row) => <span className="text-slate-300">{row.temperatura_inicial_c}°C</span>,
    },
    {
      key: 'temperatura_llegada_c',
      label: 'Temp. llegada',
      cellClassName: 'font-bold',
      render: (row) => (
        <span className={tempEnRojo(row.temperatura_llegada_c, row.tipo_producto) ? 'text-red-400' : 'text-green-500'}>
          {row.temperatura_llegada_c}°C
        </span>
      ),
    },
    {
      key: 'duracion_horas',
      label: 'Duración',
      render: (row) => <span className="text-slate-300">{row.duracion_horas}h</span>,
    },
    {
      key: 'ruta',
      label: 'Ruta',
      render: (row) => <span className="text-slate-300">{row.ruta}</span>,
    },
    {
      key: 'estado_recepcion',
      label: 'Estado',
      render: (row) => {
        if (row.estado_recepcion === 'DENTRO_RANGO') return <StatusBadge status="dentro_rango" />;
        if (row.estado_recepcion === 'ALERTA_TEMP') return <StatusBadge status="alerta_temp" />;
        return <StatusBadge status="fuera_rango" />;
      },
    },
    {
      key: 'decision_inspector',
      label: 'Decisión inspector',
      render: (row) => (
        <span
          className={`text-xs font-semibold ${String(row.decision_inspector || '').toLowerCase().includes('rechaz') ? 'text-red-400' : 'text-slate-300'}`}
        >
          {row.decision_inspector}
        </span>
      ),
    },
    {
      key: 'hash',
      label: 'Hash blockchain',
      render: (row) => (
        <div className="flex items-center gap-2">
          <HashDisplay hash={row.bloque_hash} />
          <button
            type="button"
            aria-label={`Verificar cadena de ${row.lote_id}`}
            onClick={() => onVerificar?.(row.lote_id)}
            className="inline-flex items-center gap-1 rounded-lg border border-sky-500/40 bg-sky-500/10 px-2 py-1 text-[11px] font-bold text-sky-400 transition-colors hover:bg-sky-500/20"
          >
            <ShieldCheck className="h-3 w-3" />
            Verificar
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable columns={columns} rows={transportes} pageSize={5} emptyMessage="No hay eventos de transporte con esos filtros." />
  );
}