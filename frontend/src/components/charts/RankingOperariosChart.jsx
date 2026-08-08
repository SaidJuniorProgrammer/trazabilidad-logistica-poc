import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const barColor = (pct) => (pct > 15 ? '#ef4444' : pct >= 5 ? '#f59e0b' : '#22c55e');
const MEDALLAS = ['🥇', '🥈', '🥉'];

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs shadow-2xl">
      <p className="font-bold text-slate-200">{row?.operario_nombre}</p>
      <p className="mt-1 text-slate-300">
        Tasa de alertas: <strong className="text-amber-400">{row?.tasa_alerta_pct}%</strong>
      </p>
      <p className="text-slate-400">ID: {row?.operario_id}</p>
    </div>
  );
}

export default function RankingOperariosChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
        <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
        <YAxis
          type="category"
          dataKey="operario_nombre"
          width={150}
          tick={{ fill: '#cbd5e1', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(name, i) => `${MEDALLAS[i] ?? '🥈'} ${name}`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(51,65,85,0.35)' }} />
        <Bar dataKey="tasa_alerta_pct" radius={[0, 6, 6, 0]} barSize={20}>
          {data.map((d) => (
            <Cell key={d.operario_id} fill={barColor(d.tasa_alerta_pct)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}