export default function ChartCard({ title, subtitle, badge, children, className = '', actions }) {
  return (
    <div className={`animate-fade-in-up rounded-2xl border border-slate-800 bg-slate-900 p-5 ${className}`}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-100">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {badge}
          {actions}
        </div>
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
}