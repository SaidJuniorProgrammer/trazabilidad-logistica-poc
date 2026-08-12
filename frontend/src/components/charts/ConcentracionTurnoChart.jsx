import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { COLORS } from '../../utils/colors.js';

const barColor = (ppm) => (ppm <= 100 ? '#22c55e' : ppm <= 150 ? '#f59e0b' : '#ef4444');

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs shadow-2xl">
      <p className="font-bold text-slate-200">Turno {row?.turno}</p>
      <p className="mt-1 text-slate-300">
        Promedio: <strong className="text-sky-400">{row?.ppm_promedio.toFixed(1)} ppm</strong>
      </p>
      <p className="text-slate-400">Lotes: {row?.cantidad}</p>
      <p className="text-slate-400">Operarios: {row?.operarios?.join(', ')}</p>
    </div>
  );
}

export default function ConcentracionTurnoChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis dataKey="turno" tick={{ fill: '#cbd5e1', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 180]} label={{ value: 'ppm', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(51,65,85,0.35)' }} />
        <ReferenceLine y={100} stroke={COLORS.red} strokeDasharray="6 4" label={{ value: 'China/FDA ≤100', fill: COLORS.red, fontSize: 10, position: 'insideTopRight' }} />
        <ReferenceLine y={150} stroke={COLORS.amber} strokeDasharray="6 4" label={{ value: 'UE ≤150', fill: COLORS.amber, fontSize: 10, position: 'insideTopRight' }} />
        <Bar dataKey="ppm_promedio" name="ppm promedio" radius={[6, 6, 0, 0]} barSize={46}>
          {data.map((d) => (
            <Cell key={d.turno} fill={barColor(d.ppm_promedio)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}