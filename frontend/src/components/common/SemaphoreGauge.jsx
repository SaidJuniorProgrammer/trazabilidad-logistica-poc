import { COLORS } from '../../utils/colors.js';

export default function SemaphoreGauge({ value, min, max, optimal = [min, (min + max) / 2], label }) {
  const range = max - min || 1;
  const pct = ((value - min) / range) * 100;

  let color = COLORS.green;
  const [optMin, optMax] = optimal;
  if (value < optMin || value > optMax) {
    color = Math.abs(value - (optMin + optMax) / 2) > range * 0.33 ? COLORS.red : COLORS.amber;
  }

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const arc = circumference * 0.75;
  const offset = arc * (1 - pct / 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 120 120" className="h-32 w-32">
        <g transform={`rotate(${-225 - 90} 60 60)`} />
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#1e293b" strokeWidth="10" strokeDasharray={`${arc} ${circumference}`} strokeLinecap="round" transform="rotate(135 60 60)" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${arc} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(135 60 60)"
          style={{ transition: 'stroke-dashoffset 0.6s, stroke 0.6s' }}
        />
        <text x="60" y="62" textAnchor="middle" dominantBaseline="central" className="fill-slate-100" style={{ fontSize: 22, fontWeight: 800 }}>
          {Number(value || 0).toFixed(1)}
        </text>
      </svg>
      {label && <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>}
    </div>
  );
}