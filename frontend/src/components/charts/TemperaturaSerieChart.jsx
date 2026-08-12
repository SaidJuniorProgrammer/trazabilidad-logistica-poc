import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { COLORS } from '../../utils/colors.js';
import { formatHoraCorta } from '../../utils/formatters.js';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs shadow-2xl">
      <p className="font-bold text-slate-200">{row?.timestamp ? formatHoraCorta(row.timestamp) : label}</p>
      <p className="mt-1 text-slate-300">
        Temperatura: <strong className="text-sky-400">{row?.temp ?? '-'}°C</strong>
      </p>
      {row?.ambiente != null && <p className="text-slate-400">Ambiente: {row.ambiente}°C</p>}
      {row?.gps_lat != null && (
        <p className="text-slate-400">
          GPS: {row.gps_lat}, {row.gps_lon}
        </p>
      )}
      <p className={`mt-1 font-bold ${row?.alerta ? 'text-red-400' : 'text-green-500'}`}>
        {row?.alerta ? '⚠ FUERA DE RANGO' : '✓ DENTRO DE RANGO'}
      </p>
    </div>
  );
}

export default function TemperaturaSerieChart({ serie = [], tipoProducto = 'Fresco', loteId }) {
  const esCongelado = tipoProducto === 'Congelado';
  const limite = esCongelado ? -18 : 4;

  const datos = (serie || []).map((s, i) => ({
    ...s,
    indice: i,
    alertaVal: s.alerta ? s.temp : null,
    timestamp: s.timestamp,
    label: s.timestamp ? formatHoraCorta(s.timestamp) : `M${i}`,
  }));

  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-slate-300">
        Serie Temporal — Lote{' '}
        <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-sky-400">{loteId}</code>
        <span className="ml-2 text-slate-500">· {tipoProducto}</span>
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={datos} margin={{ top: 5, right: 10, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={28} />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={esCongelado ? [-40, -12] : [-25, 10]}
            width={38}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#334155', strokeDasharray: '4 4' }} />

          <ReferenceArea y1={esCongelado ? -40 : 0} y2={esCongelado ? -18 : 4} fill={COLORS.green} fillOpacity={0.08} />

          <ReferenceLine
            y={limite}
            stroke={esCongelado ? COLORS.green : COLORS.red}
            strokeDasharray="5 5"
            strokeWidth={1.5}
            label={{ value: `${limite}°C`, fill: esCongelado ? COLORS.green : COLORS.red, fontSize: 10, position: 'insideTopRight' }}
          />
          {!esCongelado && (
            <ReferenceLine
              y={0}
              stroke={COLORS.green}
              strokeDasharray="5 5"
              strokeWidth={1.5}
              label={{ value: '0°C', fill: COLORS.green, fontSize: 10, position: 'insideBottomRight' }}
            />
          )}

          <Line type="monotone" dataKey="temp" name="Temp. cámara" stroke={COLORS.blue} strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
          <Line type="monotone" dataKey="alertaVal" name="Fuera de rango" stroke={COLORS.red} strokeWidth={2} dot={{ r: 5, fill: COLORS.red, strokeWidth: 0 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}