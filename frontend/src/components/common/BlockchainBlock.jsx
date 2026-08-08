import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { truncateHash, formatHora } from '../../utils/formatters.js';
import { COLORS } from '../../utils/colors.js';
import StatusBadge from './StatusBadge.jsx';

const ICONS = {
  genesis: { emoji: '🌱', color: COLORS.green },
  transporte: { emoji: '🚛', color: COLORS.blue },
  dosificacion: { emoji: '🧪', color: COLORS.amber },
  verificacion: { emoji: '🔬', color: COLORS.amber },
};

const DETALLE = {
  genesis: (data) => (
    <p className="text-xs text-slate-400">
      {data.descripcion}
      {data.origen && <span className="text-slate-500"> · {data.origen}</span>}
    </p>
  ),
  transporte: (data) => (
    <p className="text-xs text-slate-400">
      transporte · Temp: <strong className="text-slate-200">{data.temp}°C</strong>
      {data.gps && <span> · GPS: {data.gps}</span>}
    </p>
  ),
  dosificacion: (data) => (
    <p className="text-xs text-slate-400">
      dosificación · {data.ppm ?? data.indic} ppm · {data.volumen_ml ?? data.volumen} ml · {data.operario} ·{' '}
      {data.normativa}
    </p>
  ),
  verificacion: (data) => (
    <p className="text-xs text-slate-400">
      verificación laboratorio · <strong className="text-slate-200">{data.lab_ppm} ppm</strong> · desv.{' '}
      {data.desviacion_pct}% · {data.laboratorio}
    </p>
  ),
};

const DETALLE_FALLBACK = () => null;

export default function BlockchainBlock({ index, tipoEvento, timestamp, data = {}, hash, prevHash, valid = true }) {
  const [copiado, setCopiado] = useState(false);
  const icon = ICONS[tipoEvento] || ICONS.transporte;
  const RenderDetalle = DETALLE[tipoEvento] || DETALLE_FALLBACK;

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(hash);
    } catch {
      /* noop */
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1800);
  };

  return (
    <div>
      <div
        className={`rounded-xl border p-4 transition-colors ${
          valid ? 'border-slate-800 bg-slate-900' : 'border-red-500/60 bg-red-500/10'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base"
              style={{ backgroundColor: `${icon.color}22` }}
            >
              {icon.emoji}
            </span>
            <div>
              <p className="text-sm font-bold text-slate-100">
                [{index}] {capitalize(tipoEvento)}{' '}
                <span className="ml-1 text-xs font-normal text-slate-500">{formatHora(timestamp)}</span>
              </p>
              <div className="mt-0.5">
                <RenderDetalle data={data} />
              </div>
            </div>
          </div>
          <div className="shrink-0">
            {valid ? <StatusBadge status="validado" /> : <StatusBadge status="alterado" />}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">hash_integridad</span>
          <code className="flex-1 truncate rounded-md bg-slate-950 px-2 py-1 font-mono text-xs text-sky-400">
            {truncateHash(hash, 8, 8)}
          </code>
          <button
            type="button"
            aria-label="Copiar hash completo"
            onClick={copiar}
            className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-200"
          >
            {copiado ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>

        {!valid && (
          <p className="mt-2 text-xs font-semibold text-red-400">❌ ALTERADO: hash recalculado no coincide.</p>
        )}
      </div>

      {prevHash && String(prevHash) !== '0'.repeat(64) && (
        <div className="my-1 flex items-center justify-center">
          <span className="h-4 w-px bg-slate-700" />
        </div>
      )}
    </div>
  );
}

function capitalize(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1);
}