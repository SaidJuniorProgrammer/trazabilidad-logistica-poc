import { STATUS_COLORS } from '../../utils/colors.js';

const LABELS = {
  aprobado: 'APROBADO',
  ok: 'OK',
  alerta: 'ALERTA',
  critico: 'CRÍTICO',
  'dentro_rango': 'DENTRO RANGO',
  'fuera_rango': 'FUERA RANGO',
  'alerta_temp': 'ALERTA TÉRMICA',
  validado: 'VALIDADO',
  alterado: 'ALTERADO',
};

export default function StatusBadge({ status, label }) {
  const key = String(status || '').toLowerCase();
  const tone = STATUS_COLORS[key] || STATUS_COLORS.aprobado;
  const text = label || LABELS[key] || key.toUpperCase();

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-wide ${tone.bg} ${tone.border} ${tone.text}`}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tone.dot }} />
      {text}
    </span>
  );
}