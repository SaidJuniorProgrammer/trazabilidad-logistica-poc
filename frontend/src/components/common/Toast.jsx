import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';

const TONE = {
  success: { icon: CheckCircle2, cls: 'border-green-500/40 text-green-500' },
  error: { icon: AlertTriangle, cls: 'border-red-500/40 text-red-500' },
  info: { icon: Info, cls: 'border-sky-500/40 text-sky-500' },
};

export default function ToastContainer() {
  const { toasts, dismissToast } = useApp();

  if (!toasts.length) return null;

  return (
    <div className="pointer-events-none fixed bottom-20 right-4 z-[60] flex w-80 flex-col gap-2 md:bottom-6">
      {toasts.map((t) => {
        const tone = TONE[t.type] || TONE.info;
        const Icon = tone.icon;
        return (
          <div
            key={t.id}
            className="animate-slide-in pointer-events-auto flex items-start gap-2 rounded-xl border border-slate-700 bg-slate-900 p-3 shadow-2xl"
            role="status"
          >
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${tone.cls}`} />
            <p className="flex-1 text-sm font-medium text-slate-100">{t.message}</p>
            <button
              type="button"
              aria-label="Cerrar notificación"
              onClick={() => dismissToast(t.id)}
              className="text-slate-500 hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}