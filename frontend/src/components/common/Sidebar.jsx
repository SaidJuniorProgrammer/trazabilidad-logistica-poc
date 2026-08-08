import { NavLink } from 'react-router-dom';
import { Activity, Truck, FlaskConical, ShieldCheck, X } from 'lucide-react';
import clsx from 'clsx';

const NAV_ITEMS = [
  { to: '/', label: 'Resumen Ejecutivo', short: 'Resumen', icon: Activity },
  { to: '/transporte', label: 'Eslabón 1 — Transporte', short: 'Transporte', icon: Truck },
  { to: '/dosificacion', label: 'Eslabón 2 — Dosificación', short: 'Dosificación', icon: FlaskConical },
  { to: '/auditoria', label: 'Auditoría Blockchain', short: 'Auditoría', icon: ShieldCheck },
];

export function SidebarContent({ onNavigate }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-lg text-white shadow-lg shadow-sky-500/20">
          🦐
        </div>
        <div>
          <h1 className="text-base font-black leading-tight tracking-tight text-slate-100">ShrimpColdChain</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">PoC Trazabilidad</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                isActive
                  ? 'bg-sky-500/15 text-sky-400 ring-1 ring-inset ring-sky-500/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200',
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-800 p-4 text-[11px] leading-relaxed text-slate-600">
        <p className="font-bold uppercase tracking-wider text-slate-500">PoC Académica · UPSE</p>
        <p className="mt-1">SHA-256 · GACC China · UE · FDA</p>
      </div>
    </div>
  );
}

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800 bg-slate-900/95 backdrop-blur md:hidden">
      <div className="flex items-stretch justify-around">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-bold',
                isActive ? 'text-sky-400' : 'text-slate-500',
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.short}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export function SidebarDrawer({ open, onClose }) {
  return (
    <div className={`fixed inset-0 z-50 md:hidden ${open ? '' : 'pointer-events-none'}`}>
      <div
        className={`absolute inset-0 bg-black/60 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <aside
        className={`absolute left-0 top-0 h-full w-[220px] bg-slate-950 ring-1 ring-slate-800 transition-transform ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!open}
      >
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={onClose}
          className="absolute right-3 top-4 rounded-lg p-1 text-slate-500 hover:bg-slate-800"
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarContent onNavigate={onClose} />
      </aside>
    </div>
  );
}