import { useEffect, useRef, useState } from 'react';
import { RotateCcw, Search, ShieldCheck, ShieldX, Waypoints } from 'lucide-react';
import { truncateHash } from '../../utils/formatters.js';
import AuditSummary from './AuditSummary.jsx';

export default function HashVerifier({
  loteId,
  setLoteId,
  sugerencias = [],
  onVerificar,
  verificando,
  verificado,
  progreso,
  log = [],
  limpiar,
}) {
  const [sugerencia, setSugerencia] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (log.length) bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [log]);

  const coincide = sugerencias.filter((s) => !loteId || String(s).toLowerCase().includes(loteId.toLowerCase()));

  const pct = progreso.total ? Math.round((progreso.actual / progreso.total) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Buscador + verificación */}
      <div className="animate-fade-in-up rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={loteId}
                onFocus={() => setSugerencia(true)}
                onBlur={() => setTimeout(() => setSugerencia(false), 200)}
                onChange={(e) => setLoteId(e.target.value)}
                placeholder="Buscar lote (ej. ECU-PLANTA-003-2026-08-08)"
                aria-label="ID de lote para verificación"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3.5 pl-11 pr-4 font-mono text-sm text-slate-100 placeholder:font-sans placeholder:text-slate-600 focus:border-sky-500 focus:outline-none"
              />
            </div>
            {sugerencia && coincide.length > 0 && (
              <ul className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-slate-800 bg-slate-900 shadow-2xl">
                {coincide.slice(0, 8).map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      onMouseDown={() => {
                        setLoteId(s);
                        setSugerencia(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left font-mono text-xs text-sky-400 transition-colors hover:bg-slate-800"
                    >
                      <Waypoints className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onVerificar?.(loteId)}
              disabled={verificando || !loteId}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-500/20 transition-all hover:from-sky-500 hover:to-blue-500 disabled:opacity-60 lg:flex-initial"
            >
              {verificando ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Verificando…
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Verificar Cadena
                </>
              )}
            </button>
            {verificado && (
              <button
                type="button"
                onClick={limpiar}
                aria-label="Limpiar verificación"
                className="rounded-xl border border-slate-800 px-3 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Barra de progreso */}
        {verificando && (
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-[11px] font-bold uppercase tracking-wider">
              <span className="text-sky-400">Recalculando hashes desde génesis…</span>
              <span className="text-slate-400">
                {progreso.actual}/{progreso.total} · {pct}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-500 transition-all duration-200"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Resultado */}
      {verificado && (
        <div
          className={`animate-slide-in rounded-2xl border p-5 ${
            verificado.valido ? 'border-green-500/50 bg-green-500/10' : 'border-red-500/50 bg-red-500/10'
          }`}
        >
          <div className="flex flex-wrap items-start gap-4">
            <div className={`rounded-2xl p-3 ${verificado.valido ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
              {verificado.valido ? <ShieldCheck className="h-10 w-10" /> : <ShieldX className="h-10 w-10" />}
            </div>
            <div className="min-w-[260px] flex-1">
              <h3 className={`text-xl font-black ${verificado.valido ? 'text-green-400' : 'text-red-400'}`}>
                {verificado.valido ? '✅ CADENA VÁLIDA' : '❌ CADENA COMPROMETIDA'}
              </h3>
              <p className="mt-1 text-sm text-slate-300">
                {verificado.valido
                  ? `Todos los ${verificado.total_bloques} bloques del lote ${loteId} pasaron verificación criptográfica SHA-256. Sin alteraciones detectadas.`
                  : `Se detectó alteración en bloque #${verificado.bloque_alterado}. Hash recalculado no coincide con hash almacenado.`}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <AuditSummary verificado={verificado} />
          </div>
        </div>
      )}

      {/* Panel de recálculo de hashes */}
      {log.length > 0 && (
        <div className="animate-slide-in rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-sky-400">Recalculando hashes desde génesis…</p>
          <div className="max-h-56 space-y-1 overflow-y-auto font-mono text-[11px]">
            {log.map((line) => (
              <p key={`${line.index}-${line.hash}`} className="flex flex-wrap items-center gap-1.5">
                <span className={line.valid ? 'text-green-500' : 'text-red-400'}>{line.valid ? '✓' : '✗'}</span>
                <span className="text-slate-500">Bloque {line.index}:</span>
                <span className="text-slate-400">SHA256(payload) =</span>
                <span className="text-sky-400">{truncateHash(line.hash, 4, 4)}</span>
                <span className={line.valid ? 'text-green-500' : 'text-red-400'}>
                  {line.valid ? '✓ Coincide' : '✗ No coincide'}
                </span>
              </p>
            ))}
            <p className="pt-1 text-slate-200">
              ✅ RESULTADO: {verificado?.bloques_validos ?? 0}/{verificado?.total_bloques ?? 0} bloques válidos —{' '}
              {verificado?.valido ? 'Cadena íntegra' : 'Alteración detectada'}
            </p>
            <div ref={bottomRef} />
          </div>
        </div>
      )}
    </div>
  );
}