import { AlertTriangle, CheckCircle2, Lightbulb, XCircle } from 'lucide-react';

const CONFIG = {
  critico: {
    icon: XCircle,
    border: 'border-red-500/40',
    bg: 'bg-red-500/10',
    accent: 'text-red-500',
    ring: 'from-red-500/20',
    label: 'ALERTA CRÍTICA',
  },
  alerta: {
    icon: AlertTriangle,
    border: 'border-amber-500/40',
    bg: 'bg-amber-500/10',
    accent: 'text-amber-500',
    ring: 'from-amber-500/20',
    label: 'ALERTA',
  },
  ok: {
    icon: CheckCircle2,
    border: 'border-green-500/40',
    bg: 'bg-green-500/10',
    accent: 'text-green-500',
    ring: 'from-green-500/20',
    label: 'OK',
  },
};

export default function AlertBanner({ type = 'alerta', message, suggestion, onClose }) {
  const cfg = CONFIG[type] || CONFIG.alerta;
  const Icon = cfg.icon;

  return (
    <div
      className={`relative flex flex-col gap-2 overflow-hidden rounded-2xl border ${cfg.border} bg-gradient-to-r ${cfg.ring} to-transparent p-4 sm:flex-row sm:items-center sm:justify-between`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 shrink-0 rounded-xl bg-slate-900 p-2 ${cfg.accent}`} style={{ backgroundColor: 'rgba(15,23,42,0.8)' }}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className={`text-[11px] font-bold uppercase tracking-widest ${cfg.accent}`}>{cfg.label}</p>
          <p className="mt-1 font-semibold text-slate-100">{message}</p>
          {suggestion && (
            <p className="mt-1.5 flex items-start gap-2 text-sm text-slate-400">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <span> <strong className="text-slate-300">Sugerencia:</strong> {suggestion}</span>
            </p>
          )}
        </div>
      </div>
      {onClose && (
        <button
          type="button"
          aria-label="Cerrar alerta"
          onClick={onClose}
          className="self-start rounded-lg px-2 py-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-200 sm:self-center"
        >
          ✕
        </button>
      )}
    </div>
  );
}