export default function Header({ title, subtitle, right, children }) {
  return (
    <header className="animate-fade-in-up mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-100">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        {children}
      </div>
      {right && <div className="flex flex-wrap items-center gap-3">{right}</div>}
    </header>
  );
}