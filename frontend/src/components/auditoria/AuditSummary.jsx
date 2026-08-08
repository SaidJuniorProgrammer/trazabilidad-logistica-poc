import { Fingerprint } from 'lucide-react';

export default function AuditSummary({ verificado }) {
  const items = [
    { label: 'Bloques totales', value: verificado?.total_bloques ?? '—' },
    { label: 'Bloques válidos', value: verificado?.bloques_validos ?? '—', ok: true },
    {
      label: 'Alteraciones detectadas',
      value: verificado?.alteraciones ?? '—',
      ok: verificado?.valido,
    },
    { label: 'Algoritmo', value: 'SHA-256', icon: true },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{item.label}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xl font-black text-slate-100">
            {item.icon && <Fingerprint className="h-4 w-4 text-sky-500" />}
            <span className={item.ok === false ? 'text-red-400' : item.ok === true ? 'text-green-400' : ''}>
              {item.value}
            </span>
          </p>
        </div>
      ))}
    </div>
  );
}