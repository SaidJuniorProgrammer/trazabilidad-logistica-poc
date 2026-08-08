import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

function CenterLabel({ aprobados }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
      <span className="text-3xl font-black tracking-tight text-slate-100">{Number(aprobados || 0).toFixed(1)}%</span>
      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Aprobados</span>
    </div>
  );
}

export default function NormativaDonutChart({ data = [], aprobados }) {
  const total = data.reduce((acc, d) => acc + (d.lotes || 0), 0) || 1;

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="lotes"
            nameKey="normativa"
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={3}
            stroke="none"
          >
            {data.map((entry) => (
              <Cell key={entry.normativa} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${value}%`, 'Distribución']}
            contentStyle={{
              backgroundColor: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: 10,
              color: '#f1f5f9',
              fontSize: 12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <CenterLabel aprobados={aprobados} />

      <div className="mt-2 grid grid-cols-3 gap-2">
        {data.map((d) => {
          const pct = ((d.lotes || 0) / total) * 100;
          return (
            <div key={d.normativa} className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-[11px] font-semibold text-slate-400">{d.normativa}</span>
              </div>
              <p className="mt-1 text-lg font-extrabold text-slate-100">{pct.toFixed(0)}%</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}