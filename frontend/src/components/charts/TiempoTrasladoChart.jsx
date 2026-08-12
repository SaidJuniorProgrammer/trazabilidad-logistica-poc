import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { COLORS } from '../../utils/colors.js';

const PERIODOS = [
  { key: 'actual', label: 'Actual' },
  { key: 'mesAnterior', label: 'Mes anterior' },
  { key: 'trimAnterior', label: 'Trimestre anterior' },
];

export default function TiempoTrasladoChart({ data = [] }) {
  const [periodo, setPeriodo] = useState('actual');
  const maxPermitido = 4;

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold text-slate-300">Tiempo promedio de traslado por ruta (horas)</p>
        <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-0.5">
          {PERIODOS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPeriodo(p.key)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition-colors ${
                periodo === p.key ? 'bg-sky-500/20 text-sky-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="ruta" tick={{ fill: '#cbd5e1', fontSize: 9 }} axisLine={false} tickLine={false} interval={0} angle={-22} textAnchor="end" height={56} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 5]} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: 10,
              color: '#f1f5f9',
              fontSize: 12,
            }}
            formatter={(v) => [`${v} h`, 'Promedio']}
            cursor={{ fill: 'rgba(51,65,85,0.35)' }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
          <ReferenceLine y={maxPermitido} stroke={COLORS.red} strokeDasharray="5 5" label={{ value: `máx ${maxPermitido}h`, fill: COLORS.red, fontSize: 10, position: 'insideTopRight' }} />
          <Bar dataKey={periodo} radius={[5, 5, 0, 0]} barSize={34}>
            {data.map((d) => (
              <Cell key={d.ruta} fill={d[periodo] > maxPermitido ? COLORS.red : COLORS.blue} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}