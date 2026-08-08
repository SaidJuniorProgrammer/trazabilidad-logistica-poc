import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs shadow-2xl">
      <p className="font-bold text-slate-200">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="font-bold text-slate-100">{p.value}</span>
          {row?.pct && (
            <span className="text-slate-500">({row[`pct${p.dataKey}`]?.toFixed(0)}%)</span>
          )}
        </p>
      ))}
      <p className="mt-1 border-t border-slate-800 pt-1 text-slate-400">Total: {row?.total ?? 0}</p>
    </div>
  );
}

export default function ValidacionNormativaChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis dataKey="normativa" tick={{ fill: '#cbd5e1', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(51,65,85,0.35)' }} />
        <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
        <Bar dataKey="APROBADO" name="APROBADO" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
        <Bar dataKey="ALERTA" name="ALERTA" stackId="a" fill="#f59e0b" />
        <Bar dataKey="CRÍTICO" name="CRÍTICO" stackId="a" fill="#ef4444" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}