import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { COLORS } from '../../utils/colors.js';

const promedio = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((acc, p) => acc + (p.value || 0), 0);
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs shadow-2xl">
      <p className="mb-1 font-bold text-slate-200">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="font-bold text-slate-100">{p.value}</span>
        </p>
      ))}
      <p className="mt-1 border-t border-slate-800 pt-1 text-slate-400">
        Total: <strong className="text-sky-400">{total} alertas</strong>
      </p>
    </div>
  );
}

export default function AlertasEvolutionChart({ data = [] }) {
  const avgTerm = promedio(data.map((d) => d.termicas || 0)).toFixed(1);
  const avgDos = promedio(data.map((d) => d.dosificacion || 0)).toFixed(1);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="gradTerm" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.4} />
            <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradDos" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.amber} stopOpacity={0.35} />
            <stop offset="95%" stopColor={COLORS.amber} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis
          dataKey="fecha"
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(d) => d.slice(5)}
        />
        <YAxis domain={[0, 20]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#334155', strokeDasharray: '4 4' }} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
        <ReferenceLine
          y={Number(avgTerm)}
          stroke={COLORS.blue}
          strokeDasharray="5 5"
          strokeOpacity={0.6}
          label={{ value: `prom ${avgTerm}`, fill: COLORS.blue, fontSize: 10, position: 'insideTopRight' }}
        />
        <ReferenceLine
          y={Number(avgDos)}
          stroke={COLORS.amber}
          strokeDasharray="5 5"
          strokeOpacity={0.6}
          label={{ value: `prom ${avgDos}`, fill: COLORS.amber, fontSize: 10, position: 'insideTopRight' }}
        />
        <Area type="monotone" dataKey="termicas" name="Alertas térmicas" stroke={COLORS.blue} strokeWidth={2} fill="url(#gradTerm)" />
        <Area type="monotone" dataKey="dosificacion" name="Alertas dosificación" stroke={COLORS.amber} strokeWidth={2} fill="url(#gradDos)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}