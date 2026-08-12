import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const barColor = (n) => (n > 10 ? '#ef4444' : n >= 5 ? '#f59e0b' : '#22c55e');

export default function AlertasPorRutaChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="ruta"
          width={150}
          tick={{ fill: '#cbd5e1', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: 'rgba(51,65,85,0.35)' }}
          contentStyle={{
            backgroundColor: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: 10,
            color: '#f1f5f9',
            fontSize: 12,
          }}
          formatter={(v) => [`${v} alertas`, 'Cantidad']}
        />
        <Bar dataKey="alertas" radius={[0, 6, 6, 0]} barSize={18}>
          {data.map((d) => (
            <Cell key={d.ruta} fill={barColor(d.alertas)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}