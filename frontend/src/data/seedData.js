export const LOTE_REFERENCIA = 'ECU-PLANTA-003-2026-08-08';

export const PRECIO_USD_KG = 8.5;
export const VERSION_SEED = '2026-08-08';

export const RUTAS = [
  'Guayaquil → Manta',
  'Guayaquil → Posorja',
  'Guayaquil → Salinas',
  'Manta → Posorja',
  'Durán → Guayaquil',
  'Posorja → Playas',
  'Guayaquil → Playas',
  'Manta → Salinas',
  'Durán → Posorja',
  'Guayaquil → Santa Elena',
];

const AMBIENTE_POR_RUTA = {
  'Guayaquil → Manta': 31,
  'Guayaquil → Posorja': 30,
  'Guayaquil → Salinas': 28,
  'Manta → Posorja': 29,
  'Durán → Guayaquil': 32,
  'Posorja → Playas': 27,
  'Guayaquil → Playas': 30,
  'Manta → Salinas': 28,
  'Durán → Posorja': 31,
  'Guayaquil → Santa Elena': 33,
};

function round2(x) {
  return Math.round(x * 100) / 100;
}

export function buildSerie({ tipoProducto, n, inicio, duracionHoras, lat, lon, perfil }) {
  const tipo = tipoProducto === 'Congelado' ? 'congelado' : 'fresco';
  const pasoMin = (duracionHoras * 60) / (n - 1);
  const ambiente = AMBIENTE_POR_RUTA[perfil.ruta] ?? 30;

  return Array.from({ length: n }).map((_, i) => {
    const t = i * pasoMin;
    const fecha = new Date(new Date(inicio).getTime() + t * 60000).toISOString();

    let temp;
    if (tipo === 'congelado') {
      temp = perfil.base + Math.sin(i * 0.7) * perfil.amp;
    } else {
      temp = perfil.base + Math.sin(i * 0.8 + 1) * perfil.amp;
    }
    if (perfil.spikeIndex !== undefined && i === perfil.spikeIndex) {
      temp += perfil.spikeDelta;
    }

    const progreso = i / (n - 1);
    const drift = perfil.drift !== undefined ? perfil.drift * progreso : 0;
    temp = temp + drift;

    const lati = lat - progreso * 0.12;
    const loni = lon + progreso * 0.11;

    return {
      tiempo: t,
      timestamp: fecha,
      temp: round2(temp),
      ambiente: round2(ambiente + Math.sin(i * 0.5) * 2.5),
      gps_lat: round2(lati),
      gps_lon: round2(loni),
      alerta:
        tipo === 'congelado' ? temp > -18 : temp < 0 || temp > 4,
    };
  });
}

export const RAW_TRANSPORTES = [
  {
    evento_transporte_id: 'evt-001',
    lote_id: 'ECU-FINCA-007-2026-08-08',
    tipo_producto: 'Fresco',
    peso_kg: 500,
    temperatura_inicial_c: 0.5,
    gps_lat: -2.1294,
    gps_lon: -79.5678,
    timestamp_lectura: '2026-08-08T06:30:00Z',
    duracion_horas: 3.2,
    n: 15,
    ruta: 'Guayaquil → Manta',
    decision_inspector: 'Rechazado',
    perfil: { base: 2.6, amp: 0.4, spikeIndex: 6, spikeDelta: 3.4, ruta: 'Guayaquil → Manta' },
  },
  {
    evento_transporte_id: 'evt-002',
    lote_id: 'ECU-FINCA-001-2026-08-08',
    tipo_producto: 'Fresco',
    peso_kg: 900,
    temperatura_inicial_c: 1.2,
    gps: [-2.145, -79.972],
    timestamp_lectura: '2026-08-08T06:55:00Z',
    duracion_horas: 2.6,
    n: 13,
    ruta: 'Guayaquil → Posorja',
    decision_inspector: 'Aprobado',
    perfil: { base: 2.4, amp: 0.35, ruta: 'Guayaquil → Posorja' },
  },
  {
    evento_transporte_id: 'evt-003',
    lote_id: 'ECU-CAMPO-004-2026-08-08',
    tipo_producto: 'Fresco',
    peso_kg: 620,
    temperatura_inicial_c: 2.1,
    gps: [-2.201, -80.21],
    timestamp_lectura: '2026-08-08T07:10:00Z',
    duracion_horas: 3.0,
    n: 15,
    ruta: 'Guayaquil → Salinas',
    decision_inspector: 'Aprobado',
    perfil: { base: 2.7, amp: 0.3, ruta: 'Guayaquil → Salinas' },
  },
  {
    evento_transporte_id: 'evt-004',
    lote_id: 'ECU-FINCA-002-2026-08-08',
    tipo_producto: 'Fresco',
    peso_kg: 900,
    temperatura_inicial_c: 0.8,
    g_lat: [-2.159, -79.783],
    timestamp_lectura: '2026-08-08T07:20:00Z',
    duracion_horas: 2.2,
    n: 11,
    ruta: 'Durán → Guayaquil',
    decision_inspector: 'Degradado 2da calidad',
    perfil: { base: 3.1, amp: 0.5, spikeIndex: 4, spikeDelta: 1.2, ruta: 'Durán → Guayaquil' },
  },
  {
    evento_transporte_id: 'evt-005',
    lote_id: 'ECU-CAMPO-009-2026-08-08',
    tipo_producto: 'Congelado',
    peso_kg: 1200,
    temperatura_inicial_c: -19.5,
    gps_lat: -2.152,
    gps_lon: -80.145,
    timestamp_lectura: '2026-08-08T08:00:00Z',
    duracion_horas: 4.1,
    n: 20,
    ruta: 'Guayaquil → Posorja',
    decision_inspector: 'Aprobado',
    perfil: { base: -19.7, amp: 0.5, ruta: 'Guayaquil → Posorja' },
  },
  {
    evento_transporte_id: 'evt-006',
    lote_id: 'ECU-FINCA-003-2026-08-08',
    tipo_producto: 'Fresco',
    peso_kg: 540,
    temperatura_inicial_c: 1.5,
    gps: [-1.601, -80.88],
    timestamp_lectura: '2026-08-08T07:40:00Z',
    duracion_horas: 2.8,
    n: 14,
    ruta: 'Manta → Salinas',
    decision_inspector: 'Aprobado',
    perfil: { base: 2.2, amp: 0.4, ruta: 'Manta → Salinas' },
  },
  {
    evento_transporte_id: 'evt-007',
    lote_id: 'ECU-FINCA-008-2026-08-08',
    tipo_producto: 'Congelado',
    peso_kg: 1500,
    temperatura_inicial_c: -20.1,
    gps: [-2.233, -80.67],
    timestamp_lectura: '2026-08-08T08:15:00Z',
    duracion_horas: 1.9,
    n: 10,
    ruta: 'Posorja → Playas',
    decision_inspector: 'Degradado 2da calidad',
    perfil: { base: -19.3, amp: 0.6, spikeIndex: 3, spikeDelta: 2.0, ruta: 'Posorja → Playas' },
  },
  {
    evento_transporte_id: 'evt-008',
    lote_id: 'ECU-PLANTA-003-2026-08-08',
    tipo_producto: 'Fresco',
    peso_kg: 800,
    temperatura_inicial_c: 1.5,
    gps: [-2.1234, -79.5678],
    timestamp_lectura: '2026-08-08T00:00:00Z',
    duracion_horas: 22,
    n: 44,
    ruta: 'Guayaquil → Manta',
    decision_inspector: 'Aprobado',
    perfil: { base: 2.5, amp: 0.4, ruta: 'Guayaquil → Manta' },
  },
  {
    evento_transporte_id: 'evt-009',
    lote_id: 'ECU-FINCA-010-2026-08-08',
    tipo_producto: 'Congelado',
    peso_kg: 1350,
    temperatura_inicial_c: -20.4,
    gps: [-2.18, -79.91],
    timestamp_lectura: '2026-08-08T08:45:00Z',
    duracion_horas: 3.6,
    n: 18,
    ruta: 'Durán → Posorja',
    decision_inspector: 'Aprobado',
    perfil: { base: -20.1, amp: 0.4, ruta: 'Durán → Posorja' },
  },
  {
    evento_transporte_id: 'evt-010',
    lote_id: 'ECU-CAMPO-002-2026-08-08',
    tipo_producto: 'Fresco',
    peso_kg: 480,
    temperatura_inicial_c: 0.9,
    gps: [-2.301, -80.238],
    timestamp_lectura: '2026-08-08T09:05:00Z',
    duracion_horas: 3.4,
    n: 17,
    ruta: 'Guayaquil → Santa Elena',
    decision_inspector: 'Aprobado',
    perfil: { base: 2.9, amp: 0.5, ruta: 'Guayaquil → Santa Elena' },
  },
];

export const RAW_DOSIFICACIONES = [
  {
    dosificacion_id: 'dos-001',
    lote_id: 'ECU-PLANTA-003-2026-08-08',
    concentracion_ppm: 105,
    volumen_ml: 1250,
    peso_lote_kg: 500,
    operario_id: 'OP-007',
    operario_nombre: 'Juan Pérez',
    turno: 'Noche',
    normativa_destino: 'China/GACC',
    timestamp_registro: '2026-08-08T09:45:00Z',
    resultado_lab_verificacion_ppm: 102,
  },
  {
    dosificacion_id: 'dos-002',
    lote_id: 'ECU-FINCA-003-2026-08-08',
    concentracion_ppm: 145,
    volumen_ml: 900,
    peso_lote_kg: 720,
    operario_id: 'OP-003',
    operario_nombre: 'María Fernández',
    turno: 'Tarde',
    normativa_destino: 'UE',
    timestamp_registro: '2026-08-08T14:20:00Z',
    resultado_lab_verificacion_ppm: 148,
  },
  {
    dosificacion_id: 'dos-003',
    lote_id: 'ECU-FINCA-007-2026-08-08',
    concentracion_ppm: 98,
    volumen_ml: 1250,
    peso_lote_kg: 500,
    operario_id: 'OP-002',
    operario_nombre: 'Carlos Ramírez',
    turno: 'Mañana',
    normativa_destino: 'China/GACC',
    timestamp_registro: '2026-08-08T08:00:00Z',
    resultado_lab_verificacion_ppm: 101,
  },
  {
    dosificacion_id: 'dos-004',
    lote_id: 'ECU-CAMPO-009-2026-08-08',
    concentracion_ppm: 88,
    volumen_ml: 700,
    peso_lote_kg: 1200,
    operario_id: 'OP-005',
    operario_nombre: 'Luis Vera',
    turno: 'Mañana',
    normativa_destino: 'FDA/EE.UU.',
    timestamp_registro: '2026-08-08T07:30:00Z',
    resultado_lab_verificacion_ppm: 85,
  },
  {
    dosificacion_id: 'dos-005',
    lote_id: 'ECU-FINCA-001-2026-08-08',
    concentracion_ppm: 95,
    volumen_ml: 800,
    peso_lote_kg: 850,
    operario_id: 'OP-004',
    operario_nombre: 'Ana Quiñónez',
    turno: 'Mañana',
    normativa_destino: 'China/GACC',
    timestamp_registro: '2026-08-08T11:50:00Z',
    resultado_lab_verificacion_ppm: 96,
  },
  {
    dosificacion_id: 'dos-006',
    lote_id: 'ECU-CAMPO-201-2026-08-08',
    concentracion_ppm: 160,
    volumen_ml: 1100,
    peso_lote_kg: 700,
    operario_id: 'OP-007',
    operario_nombre: 'Juan Pérez',
    turno: 'Noche',
    normativa_destino: 'UE',
    timestamp_registro: '2026-08-08T16:10:00Z',
    resultado_lab_verificacion_ppm: 158,
  },
  {
    dosificacion_id: 'dos-007',
    lote_id: 'ECU-CAMPO-005-2026-08-08',
    concentracion_ppm: 102,
    volumen_ml: 950,
    peso_lote_kg: 680,
    operario_id: 'OP-002',
    operario_nombre: 'Carlos Ramírez',
    turno: 'Tarde',
    normativa_destino: 'China/GACC',
    timestamp_registro: '2026-08-08T13:05:00Z',
    resultado_lab_verificacion_ppm: 100,
  },
  {
    dosificacion_id: 'dos-008',
    lote_id: 'ECU-FINCA-006-2026-08-08',
    concentracion_ppm: 70,
    volumen_ml: 600,
    peso_lote_kg: 620,
    op: 'OP-003',
    operario_nombre: 'María Fernández',
    turno: 'Mañana',
    normativa_destino: 'FDA/EE.UU.',
    timestamp_registro: '2026-08-08T06:40:00Z',
    resultado_lab_verificacion_ppm: 71,
  },
];

export const ALERTAS_ACTIVAS_SEED = [
  {
    id: 'al-001',
    severidad: 'crítico',
    eslabon: 'Dosificación',
    lote: 'ECU-PLANTA-003-2026-08-08',
    titulo: 'Lote ECU-PLANTA-003-2026-08-08 excede límite GACC China (105 ppm SO₂ residual)',
    message: 'Riesgo financiero: USD 4,250. Emitido por dosificación con normativa China/GACC.',
    suggestion: 'Redirigir lote a mercado UE (≤150 ppm).',
    riesgo: 4250,
    fecha: '2026-08-08T09:45:00Z',
  },
  {
    id: 'A-002',
    severidad: 'alerta',
    eslabon: 'Transporte',
    titulo: 'Ruta Guayaquil → Manta presenta 3 eventos fuera de rango en las últimas 6 horas',
    message: 'Temp. ambiente Open-Meteo: 31°C. Posible falla de compresor en unidad refrigerada.',
    sugerencia: 'Revisar unidad PC-77 y registrar mantenimiento preventivo.',
    riesgo: 0,
    fecha: '2026-08-08T12:10:00Z',
  },
  {
    id: 'A-003',
    severidad: 'ok',
    eslabas: 'Blockchain',
    titulo: 'Verificación criptográfica SHA-256 completada sin alteraciones',
    message: '47/47 bloques del lote ECU-PLANTA-003-2026-08-08 válidos.',
    sugg: null,
    riesgo: 0,
    fecha: '2026-08-08T11:20:00Z',
  },
];

export const ALERTAS_EVOLUCION_14D = [
  { fecha: '2026-07-26', termicas: 3, dosificacion: 1 },
  { fecha: '2026-07-27', termicas: 2, dosificacion: 0 },
  { fecha: '2026-07-28', termicas: 5, dosificacion: 2 },
  { fecha: '2026-07-29', termicas: 1, dosificacion: 1 },
  { fecha: '2026-07-30', termicas: 3, dosificacion: 2 },
  { fecha: '2026-07-31', termicas: 4, dosificacion: 1 },
  { fecha: '2026-08-01', termicas: 2, dosificacion: 0 },
  { fecha: '2026-08-02', termicas: 6, dosificacion: 3 },
  { fecha: '2026-08-03', termicas: 3, dosificacion: 2 },
  { fecha: '2026-08-04', termicas: 2, dosificacion: 1 },
  { fecha: '2026-08-05', termicas: 4, dosificacion: 2 },
  { fecha: '2026-08-06', termicas: 7, dosificacion: 3 },
  { fecha: '2026-08-07', termicas: 5, dosificacion: 2 },
  { fecha: '2026-08-08', termicas: 8, dosificacion: 4 },
];

export const NORMATIVA_DISTRIBUCION = [
  { normativa: 'China/GACC', lotes: 62, color: '#22c55e' },
  { normativa: 'UE', lotes: 18, color: '#f59e0b' },
  { normativa: 'FDA/EE.UU.', lotes: 10, color: '#ef4444' },
];

export const TOTAL_DOSIFICACIONES_MES = 90;
export const APROBADOS_PORCENTAJE = 87.5;

export const OPERARIOS_RANKING_SEED = [
  { operario_id: 'OP-002', operario_nombre: 'Carlos Ramírez', tasa_alerta_pct: 16.4 },
  { operario_id: 'OP-007', operario_nombre: 'Juan Pérez', tasa_alerta_pct: 12.8 },
  { operario_id: 'OP-003', operario_nombre: 'María Fernández', tasa_alerta_pct: 6.2 },
  { operario_id: 'OP-005', operario_nombre: 'Luis Vera', tasa_alerta_pct: 3.1 },
  { operario_id: 'OP-004', operario_nombre: 'Ana Quiñónez', tasa_alerta_pct: 1.8 },
];

export const KPIS_RESUMEN_SEED = {
  cumplimiento_termico: 94.2,
  dosificacion_aprobada: 87.5,
  integridad_blockchain: 100,
  riesgo_acumulado: 127500,
  lotes_transportados_mes: 124,
  dosificaciones_mes: 80,
};

export const KPIS_TRANSPORTE_SEED = {
  temp_promedio: 2.3,
  tiempo_promedio_traslado: 2.4,
  alertas_termicas_hoy: 3,
  lotes_rechazados_mes: 7,
  perdida_estimada: 23800,
};

export const CLIMA_AMBIENTE_POR_RUTA = {
  'Guayaquil → Manta': { lat: -1.043, lon: -80.44 },
  'Guayaquil → Posorja': { lat: -2.72, lon: -80.25 },
  'Guayaquil → Salinas': { lat: -2.21, lon: -80.19 },
  'Manta → Posorja': { lat: -1.81, lon: -80.52 },
  'Durán → Guayaquil': { lat: -2.16, lon: -79.83 },
  'Posorja → Playas': { lat: -2.63, lon: -80.39 },
  'Guayaquil → Playas': { lat: -2.2, lon: -80.35 },
  'Manta → Salinas': { lat: -1.47, lon: -80.73 },
  'Durán → Posorja': { lat: -2.43, lon: -80.12 },
  'Guayaquil → Santa Elena': { lat: -2.23, lon: -80.85 },
};

export const TIEMPOS_TRASLADO_MES = [
  { ruta: 'Guayaquil → Manta', actual: 2.6, mesAnterior: 3.1, trimAnterior: 3.4 },
  { ruta: 'Guayaquil → Posorja', actual: 2.1, mesAnterior: 2.4, trimAnterior: 2.7 },
  { ruta: 'Guayaquil → Salinas', actual: 2.8, mesAnterior: 2.9, trimAnterior: 3.0 },
  { ruta: 'Manta → Posorja', actual: 3.2, mesAnterior: 3.5, trimAnterior: 3.6 },
  { ruta: 'Durán → Guayaquil', actual: 1.6, mesAnterior: 1.7, trimAnterior: 1.8 },
  { ruta: 'Posorja → Playas', actual: 1.4, mesAnterior: 1.5, trimAnterior: 1.6 },
];

export const RIESGO_FINANCIERO_MENSUAL = [
  { dia: '2026-08-01', acumulado: 4250 },
  { dia: '2026-08-02', acumulado: 4250 },
  { dia: '2026-08-03', acumulado: 12750 },
  { dia: '2026-08-04', acumulado: 17000 },
  { dia: '2026-08-05', acumulado: 21250 },
  { dia: '2026-08-06', acumulado: 25500 },
  { dia: '2026-08-07', acumulado: 34000 },
  { dia: '2026-08-08', acumulado: 46750 },
];

export const EVENTOS_CRITICOS_MIX_SEED_PARTIAL = null;