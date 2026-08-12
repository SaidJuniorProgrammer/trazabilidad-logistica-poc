export const PRECIO_REFERENCIA_USD_KG = 8.5;
export const FACTOR_CONVERSION_SO2 = 1.0;
export const DOSIS_ESTANDAR_ML_POR_KG = 2.36;

export function calcSO2Residual(concentracionPpm) {
  return (Number(concentracionPpm) || 0) * FACTOR_CONVERSION_SO2;
}

export function calcDosisTeorica(pesoKg) {
  return (Number(pesoKg) || 0) * DOSIS_ESTANDAR_ML_POR_KG;
}

export function calcRiesgoFinanciero(pesoKg) {
  return (Number(pesoKg) || 0) * PRECIO_REFERENCIA_USD_KG;
}

export function promedio(values) {
  if (!Array.isArray(values) || values.length === 0) return 0;
  return values.reduce((acc, v) => acc + Number(v), 0) / values.length;
}

export function maxOf(values) {
  if (!Array.isArray(values) || values.length === 0) return 0;
  return Math.max(...values.map(Number));
}

export function sum(values) {
  return values.reduce((acc, v) => acc + Number(v || 0), 0);
}

export function calcularCumplimientoTermico(transportes) {
  const total = transportes.length;
  if (total === 0) return 0;
  const ok = transportes.filter((t) => {
    if (t.tipo_producto === 'Congelado') return t.temperatura_llegada_c <= -18;
    return t.temperatura_llegada_c >= 0 && t.temperatura_llegada_c <= 4;
  }).length;
  return (ok / total) * 100;
}

export function calcularDosificacionAprobada(dosificaciones) {
  const total = dosificaciones.length;
  if (total === 0) return 0;
  const ok = dosificaciones.filter((d) => d.estado_validacion === 'APROBADO').length;
  return (ok / total) * 100;
}

export function calcularRiesgoAcumulado(transportes, dosificaciones) {
  const riesgoTransporte = sum(
    transportes.filter((t) => String(t.decision_inspector || '').toLowerCase().includes('rechaz')).map((t) => t.peso_kg * PRECIO_REFERENCIA_USD_KG),
  );
  const riesgoDosificacion = sum(dosificaciones.map((d) => d.riesgo_financiero_usd || 0));
  return riesgoTransporte + riesgoDosificacion;
}