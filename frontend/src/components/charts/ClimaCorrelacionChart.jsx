import { CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { COLORS } from '../../utils/colors.js';
import { formatHoraCorta } from '../../utils/formatters.js';

function ClimaBadge({ clima, cargando }) {
  if (cargando) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-[11px] font-bold text-slate-400">
        <span className="h-2 w-2 animate-pulse rounded-full bg-slate-500" />
        CONSULTANDO OPEN-METEO…
      </span>
    );
  }
  if (clima?.fuente === 'Open-Meteo') {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-green-500/40 bg-green-500/10 px-3 py-1 text-[11px] font-bold text-green-400">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
        </span>
        EN VIVO · {clima.clima} · {clima.temperatura}°C · {clima.humedad}% HUM · {clima.actualizado}
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-[11px] font-bold text-amber-400"
      title="La API de Open-Meteo no respondió; se muestra dato de respaldo simulado."
    >
      SIMULADO · fallback climático
    </span>
  );
}

export default function ClimaCorrelacionChart({ serie = [], loteId, clima = null, cargando = false }) {
  const enVivo = clima?.fuente === 'Open-Meteo';

  const mapaHoras = {};
  (clima?.serie || []).forEach((s) => {
    if (s.temp != null) mapaHoras[s.t] = s.temp;
  });

  const datos = (serie || []).map((s) => {
    const label = s.timestamp ? formatHoraCorta(s.timestamp) : String(s.tiempo ?? '');
    const hora = s.timestamp ? new Date(s.timestamp).getUTCHours() : null;
    const etiqueta = hora != null ? `${String(hora).padStart(2, '0')}:00` : null;
    const ambienteReal = etiqueta != null ? mapaHoras[etiqueta] : undefined;
    const usoReal = enVivo && ambienteReal != null;

    return {
      ...s,
      label,
      temperatura: s.temp,
      ambiente: usoReal ? ambienteReal : s.ambiente,
      simulado: !usoReal,
    };
  });

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold text-slate-300">
          Correlación Clima (Open-Meteo) vs Cámara — Lote{' '}
          <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-sky-400">{loteId}</code>
        </p>
        <ClimaBadge clima={clima} cargando={cargando} />
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={datos} margin={{ top: 5, right: -8, left: -14, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={38} />
          <YAxis yAxisId="izq" tick={{ fill: '#38bdf8', fontSize: 11 }} axisLine={false} tickLine={false} width={36} label={{ value: '°C cámara', angle: -90, position: 'insideLeft', fill: '#38bdf8', fontSize: 10 }} />
          <YAxis yAxisId="der" orientation="right" tick={{ fill: '#fb923c', fontSize: 11 }} axisLine={false} tickLine={false} domain={[20, 40]} width={40} label={{ value: '°C ambiente', angle: 90, position: 'insideRight', fill: '#fb923c', fontSize: 10 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: 10,
              color: '#f1f5f9',
              fontSize: 12,
            }}
            cursor={{ stroke: '#334155', strokeDasharray: '4 4' }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
          <Line yAxisId="izq" type="monotone" dataKey="temperatura" name="Temp. cámara" stroke={COLORS.blue} strokeWidth={2.5} dot={false} />
          <Line
            yAxisId="der"
            type="monotone"
            dataKey="ambiente"
            name={enVivo ? 'Temp. ambiente real (Open-Meteo)' : 'Temp. ambiente (simulado)'}
            stroke="#fb923c"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}