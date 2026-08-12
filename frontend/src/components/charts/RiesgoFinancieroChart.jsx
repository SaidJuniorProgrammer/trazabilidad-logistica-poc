import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { COLORS } from '../../utils/colors.js';

export default function RiesgoFinancieroChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -6, bottom: 0 }}>
        <defs>
          <linearGradient id="gradRiesgo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.red} stopOpacity={0.35} />
            <stop offset="95%" stopColor={COLORS.red} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis dataKey="dia" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(d) => d.slice(8)} />
        <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Riesgo acumulado']}
          contentStyle={{
            backgroundColor: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: 10,
            color: '#f1f5f9',
            fontSize: 12,
          }}
          cursor={{ stroke: '#334155', strokeDasharray: '4 4' }}
        />
        <Area type="monotone" dataKey="acumulado" name="Riesgo acumulado" stroke={COLORS.red} strokeWidth={2.5} fill="url(#gradRiesgo)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}