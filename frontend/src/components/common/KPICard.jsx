import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

export default function KPICard({ title, value, trend, trendUp = true, color = '#22c55e', progress = 0 }) {
  const TrendIcon = trend === undefined || trend === 0 ? Minus : trendUp ? TrendingUp : TrendingDown;

  return (
    <div className="animate-fade-in-up relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-5 transition-transform hover:-translate-y-0.5">
      <div className="absolute inset-x-0 top-0 h-[3px]" style={{ backgroundColor: color }} />
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{title}</p>
      <div className="mt-3 flex items-end justify-between gap-2">
        <span className="text-3xl font-extrabold tracking-tight text-slate-100">{value}</span>
        {trend !== undefined && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
              trendUp ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'
            }`}
          >
            <TrendIcon className="h-3.5 w-3.5" />
            {trend}
          </span>
        )}
      </div>
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}