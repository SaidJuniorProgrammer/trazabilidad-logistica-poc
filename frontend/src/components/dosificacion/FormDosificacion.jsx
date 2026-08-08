import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Send, ShieldCheck } from 'lucide-react';
import { NORMATIVAS } from '../../utils/validators.js';
import { calcDosisTeorica, calcSO2Residual } from '../../utils/calculations.js';
import { api } from '../../services/api.js';
import { useApp } from '../../context/AppContext.jsx';

const OPERARIOS = [
  { id: 'OP-001', nombre: 'Pedro Cedeño' },
  { id: 'OP-002', nombre: 'Carlos Ramírez' },
  { id: 'OP-003', nombre: 'María Fernández' },
  { id: 'OP-004', nombre: 'Ana Quiñónez' },
  { id: 'OP-005', nombre: 'Luis Vera' },
  { id: 'OP-007', nombre: 'Juan Pérez' },
];

const schema = z.object({
  lote_id: z.string().min(3, 'Ingrese un ID de lote válido'),
  concentracion_ppm: z.coerce.number().positive('Debe ser mayor a 0').max(500, 'Máximo 500 ppm'),
  volumen_ml: z.coerce.number().positive('Debe ser mayor a 0').max(5000),
  peso_lote_kg: z.coerce.number().positive('Debe ser mayor a 0').max(10000),
  operario_id: z.string().min(2),
  operario_nombre: z.string().min(2),
  turno: z.enum(['Mañana', 'Tarde', 'Noche']),
  normativa_destino: z.enum(['China/GACC', 'UE', 'FDA/EE.UU.']),
});

const inputCls = (invalid) =>
  `w-full rounded-xl border bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition-colors focus:border-sky-500 ${
    invalid ? 'border-red-500' : 'border-slate-800'
  }`;

export default function FormDosificacion({ onRegistrado, onValuesChange }) {
  const { showToast } = useApp();
  const [enviando, setEnviando] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      lote_id: 'ECU-PLANTA-003-2026-08-08',
      concentracion_ppm: 105,
      volumen_ml: 1250,
      peso_lote_kg: 500,
      operario_id: 'OP-007',
      operario_nombre: 'Juan Pérez',
      turno: 'Noche',
      normativa_destino: 'China/GACC',
    },
  });

  const concentracion = watch('concentracion_ppm');
  const peso = watch('peso_lote_kg');
  const normativa = watch('normativa_destino');
  const limite = NORMATIVAS[normativa]?.limite_ppm ?? 100;
  const so2 = calcSO2Residual(concentracion);
  const dosis = calcDosisTeorica(peso);
  const excedeLimite = Number(concentracion) > limite;
  const puedeUE = Number(concentracion) <= 150;

  useEffect(() => {
    onValuesChange?.({ concentracion: Number(concentracion) || 0, peso: Number(peso) || 0, normativa });
  }, [concentracion, peso, normativa, onValuesChange]);

  const onSubmit = async (values) => {
    setEnviando(true);
    const submitData = {
      ...values,
      operario_nombre: OPERARIOS.find((o) => o.id === values.operario_id)?.nombre || values.operario_nombre,
    };
    try {
      const creado = await api.crearDosificacion(submitData);
      showToast(`Dosificación ${creado.dosificacion_id} registrada en blockchain (SHA-256).`, 'success');
      onRegistrado?.(creado);
      reset();
    } catch {
      showToast('Error al registrar la dosificación.', 'error');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">ID Lote</label>
          <input {...register('lote_id')} className={inputCls(!!errors.lote_id)} placeholder="ECU-PLANTA-XXX" />
          {errors.lote_id && <p className="mt-1 text-xs text-red-400">{errors.lote_id.message}</p>}
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Concentración (ppm)
            {excedeLimite && <span className="normal-case text-red-400"> · excede límite</span>}
          </label>
          <input
            type="number"
            step="0.1"
            {...register('concentracion_ppm')}
            className={`${inputCls(!!errors.concentracion_ppm)} ${excedeLimite ? '!border-red-500' : ''}`}
          />
          {errors.concentracion_ppm ? (
            <p className="mt-1 text-xs text-red-400">{errors.concentracion_ppm.message}</p>
          ) : (
            <p className="mt-1 text-xs text-slate-500">
              SO₂ residual ≈ <strong className={excedeLimite ? 'text-red-400' : 'text-slate-300'}>{so2.toFixed(0)} ppm</strong> (factor 1.0)
            </p>
          )}
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Volumen (ml)</label>
          <input type="number" {...register('volumen_ml')} className={inputCls(!!errors.volumen_ml)} />
          {errors.volumen_ml && <p className="mt-1 text-xs text-red-400">{errors.volumen_ml.message}</p>}
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Peso lote (kg)</label>
          <input type="number" {...register('peso_lote_kg')} className={inputCls(!!errors.peso_lote_kg)} />
          <p className="mt-1 text-xs text-slate-500">
            Dosis teórica: <strong className="text-slate-300">{dosis.toLocaleString('en-US')} ml</strong> (2.36 ml/kg)
          </p>
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Operario</label>
          <select {...register('operario_id')} className={inputCls(!!errors.operario_id)}>
            {OPERARIOS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.id} {o.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Turno</label>
          <select {...register('turno')} className={inputCls(!!errors.turno)}>
            <option>Mañana</option>
            <option>Tarde</option>
            <option>Noche</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Normativa destino</label>
          <select {...register('normativa_destino')} className={inputCls(!!errors.normativa_destino)}>
            {Object.entries(NORMATIVAS).map(([key, v]) => (
              <option key={key} value={key}>
                {v.label} ≤ {v.limite_ppm} ppm
              </option>
            ))}
          </select>
        </div>
      </div>

      {excedeLimite && (
        <div
          className={`animate-slide-in rounded-xl border p-3 text-xs font-semibold ${
            puedeUE
              ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
              : 'border-red-500/40 bg-red-500/10 text-red-300'
          }`}
        >
          ⚠️ ALERTA: Concentración excede límite {normativa} ({limite} ppm).
          {puedeUE ? ' Redirigir a mercado UE (≤150 ppm).' : ' Excede incluso el límite UE (150 ppm). Riesgo de rechazo.'}
        </div>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-sky-500 disabled:opacity-60"
      >
        {enviando ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Registrando en blockchain…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" /> Registrar en Blockchain
          </>
        )}
      </button>

      <input type="hidden" {...register('operario_nombre')} />

      <p className="flex items-center gap-1.5 text-[11px] text-slate-600">
        <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
        Al registrar se genera el hash SHA-256 y se encadena al bloque anterior.
      </p>
    </form>
  );
}