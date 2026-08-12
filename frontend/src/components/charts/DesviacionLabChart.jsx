import { CartesianGrid, Cell, Line, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from 'recharts';
import { COLORS } from '../../utils/colors.js';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs shadow-2xl">
      <p className="font-bold text-slate-200">{row?.lote_id}</p>
      <p className="mt-1 text-slate-300">
        Registrado: <strong className="text-sky-400">{row?.x} ppm</strong>
      </p>
      <p className="text-slate-300">
        Laboratorio: <strong className="text-amber-400">{row?.y} ppm</strong>
      </p>
      <p className={`mt-1 font-bold ${row?.desviacion > 10 ? 'text-red-400' : 'text-green-500'}`}>
        Desviación: {row?.desviacion?.toFixed(1)}% {row?.desviacion > 10 ? '⚠' : '✓'}
      </p>
      <p className="text-slate-400">Operario: {row?.operario}</p>
    </div>
  );
}

export default function DesviacionLabChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: -12 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis type="number" dataKey="x" name="Registrado" unit=" ppm" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} domain={[60, 175]} label={{ value: 'Concentración registrada (ppm)', position: 'insideBottom', offset: -4, fill: '#94a3b8', fontSize: 10 }} />
        <YAxis type="number" dataKey="y" name="Laboratorio" unit=" ppm" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} domain={[60, 175]} label={{ value: 'Laboratorio (ppm)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
        <ZAxis type="number" dataKey="z" range={[80, 80]} />
        <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
        {/* Línea y=x (registro perfecto) */}
        <Line data={[{ x: 60, y: 60 }, { x: 175, y: 175 }]} stroke="#64748b" strokeWidth={1.5} strokeDasharray="6 5" dot={false} />
        <Scatter data={data} fill="#0ea5e9">
          {data.map((d) => {
            const lineaY = d.x; // y esperado = x
            const diff = Math.abs(d.y - lineaY);
            const pctDiff = lineaY ? (diff / lineaY) * 100 : 0;
            return <Cell key={`${d.lote_id}-${d.x}`} fill={pctDiff > 10 ? COLORS.red : COLORS.blue} />;
          })}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}