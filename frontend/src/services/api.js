import axios from 'axios';
import {
  RAW_TRANSPORTES,
  RAW_DOSIFICACIONES,
  RUTAS,
  LOTE_REFERENCIA,
  ALERTAS_ACTIVAS_SEED,
  ALERTAS_EVOLUCION_14D,
  NORMATIVA_DISTRIBUCION,
  OPERARIOS_RANKING_SEED,
  KPIS_RESUMEN_SEED,
  KPIS_TRANSPORTE_SEED,
  RIESGO_FINANCIERO_MENSUAL,
  TIEMPOS_TRASLADO_MES,
  PRECIO_USD_KG,
  buildSerie,
} from '../data/seedData.js';
import { sha256Hex, buildChainPayload } from '../utils/sha256.js';
import { estadoDesdeConcentracion } from '../utils/validators.js';
import { FACTOR_CONVERSION_SO2, DOSIS_ESTANDAR_ML_POR_KG, promedio, maxOf } from '../utils/calculations.js';
import { fetchClimaReal } from './openMeteo.js';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3001';

export const http = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

const listeners = new Set();
export const onDataChange = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
const emitChange = () => listeners.forEach((fn) => fn());

const NOMBRES_OPERARIOS = [
  { id: 'OP-001', nombre: 'Pedro Cedeño' },
  { id: 'OP-002', nombre: 'Carlos Ramírez' },
  { id: 'OP-003', nombre: 'María Fernández' },
  { id: 'OP-004', nombre: 'Ana Quiñónez' },
  { id: 'OP-005', nombre: 'Luis Vera' },
];

const GPS_INICIO_RUTA = {
  'Guayaquil → Manta': [-2.19, -80.78],
  'Guayaquil → Posorja': [-2.13, -79.96],
  'Guayaquil → Salinas': [-2.16, -80.23],
  'Manta → Posorja': [-0.95, -80.72],
  'Durán → Guayaquil': [-2.15, -79.89],
  'Posorja → Playas': [-2.72, -80.25],
  'Guayaquil → Playas': [-2.18, -80.1],
  'Manta → Salinas': [-1.6, -80.88],
  'Durán → Posorja': [-2.28, -79.91],
  'Guayaquil → Santa Elena': [-2.22, -80.72],
};

function latLonDe(ruta, lat, lon, gps) {
  if (Array.isArray(gps) && gps.length === 2) return gps;
  if (lat !== undefined && lon !== undefined) return [lat, lon];
  return GPS_INICIO_RUTA[ruta] || [-2.18, -80];
}

function estadoTransporteDesdeSerie(serie, tipo) {
  const tempMax = maxOf(serie.map((e) => e.temperatura));
  if (tipo === 'Congelado') {
    if (tempMax <= -18) return 'DENTRO_RANGO';
    if (tempMax <= -12) return 'ALERTA_TEMP';
    return 'FUERA_RANGO';
  }
  if (tempMax <= 4) return 'DENTRO_RANGO';
  if (tempMax <= 6) return 'ALERTA_TEMP';
  return 'FUERA_RANGO';
}

function isRechazado(decision) {
  return /rechaz/i.test(decision || '');
}

async function buildTransporteRecord(raw) {
  const [lat, lon] = latLonDe(raw.ruta, raw.gps_lat, raw.gps_lon, raw.gps);
  const serie = buildSerie({
    tipoProducto: raw.tipo_producto,
    n: raw.n ?? 12,
    inicio: raw.timestamp_lectura,
    duracionHoras: raw.duracion_horas,
    lat,
    lon,
    perfil: raw.perfil || { base: raw.tipo_producto === 'Congelado' ? -19.5 : 2.5, amp: 0.4, ruta: raw.ruta },
  });

  const temps = serie.map((e) => e.temperatura);
  const hash = await sha256Hex({
    id: raw.evento_transporte_id,
    lote: raw.lote_id,
    tipo: raw.tipo_producto,
    inicio: raw.timestamp_lectura,
    duracion: raw.duracion_horas,
    serie: temps.join(','),
    decision: raw.decision_inspector,
  });

  const estado = estadoTransporteDesdeSerie(serie, raw.tipo_producto);
  const rechazado = isRechazado(raw.decision_inspector);

  return {
    ...raw,
    gps_lat: lat,
    gps_lon: lon,
    serie,
    temperatura_camara_c: temps,
    temperatura_maxima_c: maxOf(temps),
    temperatura_promedio_c: Number(promedio(temps).toFixed(2)),
    temperatura_llegada_c: temps[temps.length - 1],
    alertas_count: serie.filter((e) => e.alerta).length,
    estado_recepcion: estado,
    rechazado,
    riesgo_financiero_usd: rechazado ? (raw.peso_kg || 500) * PRECIO_USD_KG : 0,
    bloque_hash: hash || '0'.repeat(64),
  };
}

async function buildDosificacionRecord(raw) {
  const estado = estadoDesdeConcentracion(raw.concentracion_ppm, raw.normativa_destino);
  const peso = Number(raw.peso_lote_kg) || 0;
  const riesgo = estado === 'CRÍTICO'
    ? peso * PRECIO_USD_KG
    : estado === 'ALERTA'
      ? peso * PRECIO_USD_KG * 0.2
      : 0;
  const ppm = Number(raw.concentracion_ppm) || 1;
  const desviacion = raw.resultado_lab_verificacion_ppm
    ? (Math.abs(raw.resultado_lab_verificacion_ppm - ppm) / ppm) * 100
    : 0;

  const hash = await sha256Hex({
    dosificación: raw.dosificacion_id,
    lote: raw.lote_id,
    ppm,
    normativa: raw.normativa_destino,
    operario: raw.operario_id,
    timestamp: raw.timestamp_registro,
  });

  return {
    ...raw,
    estado_validacion: estado,
    so2_residual_ppm: ppm * FACTOR_CONVERSION_SO2,
    dosis_teorica_ml: peso * DOSIS_ESTANDAR_ML_POR_KG,
    riesgo_financiero_usd: Number(riesgo),
    desviacion_lab_pct: Number(desviacion.toFixed(1)),
    bloque_hash: hash || '0'.repeat(64),
  };
}

let cache = null;

async function getDataset() {
  if (cache) return cache;
  const transportes = [];
  for (const raw of RAW_TRANSPORTES) transportes.push(await buildTransporteRecord(raw));
  const dosificaciones = [];
  for (const raw of RAW_DOSIFICACIONES) dosificaciones.push(await buildDosificacionRecord(raw));
  cache = { transportes, dosificaciones, cadenas: new Map() };
  return cache;
}

async function pushBlock(blocks, prevHash, index, timestamp, tipoEvento, data) {
  const hash = await sha256Hex(buildChainPayload({ index, timestamp, tipoEvento, data, hash_previo: prevHash }));
  blocks.push({ index, timestamp, tipoEvento, data, hash_previo: prevHash, hash_integridad: hash });
  return hash;
}

async function buildChainForLote(loteId, dataset) {
  const transport = dataset.transportes.find((t) => t.lote_id === loteId);
  const dosifs = dataset.dosificaciones.filter((d) => d.lote_id === loteId);
  const blocks = [];
  let prevHash = '0'.repeat(64);
  let index = 0;

  if (loteId === LOTE_REFERENCIA && transport) {
    prevHash = await pushBlock(blocks, prevHash, index, '2026-08-08T00:00:00Z', 'genesis', {
      origen: 'Bloque Génesis ShrimpColdChain',
      descripcion: 'Asociación Exportadora Mar Azul S.A. — Guayaquil, Ecuador',
    });
    index += 1;
    for (const lectura of transport.serie) {
      prevHash = await pushBlock(blocks, prevHash, index, lectura.timestamp, 'transporte', {
        temp: lectura.temperatura,
        gps: `${lectura.gps_lat},${lectura.gps_lon}`,
        ambiente: lectura.ambiente,
        alerta: lectura.alerta,
      });
      index += 1;
    }
    const dos = dosifs[0];
    if (dos) {
      prevHash = await pushBlock(blocks, prevHash, index, dos.timestamp_registro, 'dosificacion', {
        ppm: dos.so2_residual_ppm,
        volumen_ml: dos.volumen_ml,
        operario: `${dos.operario_id} ${dos.operario_nombre}`,
        normativa: dos.normativa_destino,
        estado: dos.estado_validacion,
      });
      index += 1;
      await pushBlock(blocks, prevHash, index, '2026-08-08T11:20:00Z', 'verificacion', {
        lab_ppm: dos.resultado_lab_verificacion_ppm,
        desviacion_pct: dos.desviacion_lab_pct,
        laboratorio: 'LAB-QUIENVIS',
      });
    }
    return blocks;
  }

  if (transport) {
    prevHash = await pushBlock(blocks, prevHash, index, transport.timestamp_lectura, 'genesis', {
      origen: `Lote ${transport.lote_id}`,
      descripcion: 'Inicio de cadena — unidad refrigerada',
    });
    index += 1;
    for (const lectura of transport.serie) {
      prevHash = await pushBlock(blocks, prevHash, index, lectura.timestamp, 'transporte', {
        temp: lectura.temperatura,
        gps: `${lectura.gps_lat},${lectura.gps_lon}`,
        ambiente: lectura.ambiente,
        alerta: lectura.alerta,
      });
      index += 1;
    }
    for (const dos of dosifs) {
      prevHash = await pushBlock(blocks, prevHash, index, dos.timestamp_registro, 'dosificacion', {
        indic: dos.so2_residual_ppm,
        volumen_ml: dos.volumen_ml,
        estado: dos.estado_validacion,
        normativa: dos.normativa_destino,
        operario: `${dos.operario_id} ${dos.operario_nombre}`,
      });
      index += 1;
    }
    if (dosifs.length) {
      const dos = dosifs[0];
      await pushBlock(blocks, prevHash, index, '2026-08-08T11:20:00Z', 'verificacion', {
        lab_ppm: dos.resultado_lab_verificacion_ppm,
        desviacion_pct: dos.desviacion_lab_pct,
        laboratorio: 'LAB-EMPAQUE',
      });
    }
    return blocks;
  }

  if (dosifs.length) {
    prevHash = await pushBlock(blocks, prevHash, index, dosifs[0].timestamp_registro, 'genesis', {
      origen: `Lote ${loteId}`,
      descripcion: 'Cadena iniciada en planta de empacado',
    });
    index += 1;
    for (const dos of dosifs) {
      prevHash = await pushBlock(blocks, prevHash, index, dos.timestamp_registro, 'dosificacion', {
        indic: dos.so2_residual_ppm,
        volumen_ml: dos.volumen_ml,
        estado: dos.estado_validacion,
        normativa: dos.normativa_destino,
        operario: `${dos.operario_id} ${dos.operario_nombre}`,
      });
      index += 1;
    }
    return blocks;
  }

  return [];
}

async function chainCompleta(loteId) {
  const dataset = await getDataset();
  if (dataset.cadenas.has(loteId)) return dataset.cadenas.get(loteId);
  let bloques = await buildChainForLote(loteId, dataset);

  if (loteId === 'ECU-FINCA-007-2026-08-08') {
    bloques = bloques.map((b) =>
      b.index === 12 && !b.tampered
        ? { ...b, hash_integridad: `${b.hash_integridad.slice(0, -1)}f`, tampered: true }
        : b,
    );
  }

  dataset.cadenas.set(loteId, bloques);
  return bloques;
}

function mapEstadoCritico(estado) {
  if (['CRÍTICO', 'FUERA_RANGO'].includes(estado)) return 'critico';
  if (['ALERTA', 'ALERTA_TEMP'].includes(estado)) return 'alerta';
  return 'aprobado';
}

async function buildEventosCriticos() {
  const dataset = await getDataset();
  const rows = [];

  for (const d of dataset.dosificaciones) {
    rows.push({
      id: d.dosificacion_id,
      lote_id: d.lote_id,
      eslabon: 'Dosificación',
      timestamp: d.timestamp_registro,
      problema: `SO₂ residual ${d.so2_residual_ppm} ppm vs límite ${d.normativa_destino}`,
      estado: mapEstadoCritico(d.estado_validacion),
      hash: d.bloque_hash,
      riesgo: d.riesgo_financiero_usd,
      tipo: 'dosificacion',
    });
  }

  for (const t of dataset.transportes) {
    rows.push({
      id: t.evento_transporte_id,
      lote_id: t.lote_id,
      eslabon: 'Transporte',
      timestamp: t.timestamp_lectura,
      problema: `Temp. llegada ${t.temperatura_llegada_c}°C · ${t.tipo_producto} · ${t.ruta}`,
      estado: mapEstadoCritico(t.estado_recepcion),
      hash: t.bloque_hash,
      riesgo: t.riesgo_financiero_usd,
      tipo: 'transporte',
    });
  }

  return rows.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
}

function turnosDataset(dataset) {
  const mapa = {};
  dataset.dosificaciones.forEach((d) => {
    const turno = d.turno || 'Mañana';
    if (!mapa[turno]) mapa[turno] = [];
    mapa[turno].push(d);
  });
  return Object.entries(mapa).map(([turno, lista]) => ({
    turno,
    ppm_promedio: lista.length ? promedio(lista.map((d) => d.concentracion_ppm)) : 0,
    cantidad: lista.length,
    operarios: [...new Set(lista.map((d) => d.operario_nombre))],
  }));
}

function validacionPorNormativa(dataset) {
  const grupos = {};
  dataset.dosificaciones.forEach((d) => {
    if (!grupos[d.normativa_destino]) {
      grupos[d.normativa_destino] = { normativa: d.normativa_destino, APROBADO: 0, ALERTA: 0, CRÍTICO: 0 };
    }
    grupos[d.normativa_destino][d.estado_validacion] += 1;
  });
  return Object.values(grupos).map((g) => {
    const total = g.APROBADO + g.ALERTA + g.CRÍTICO;
    return {
      ...g,
      total,
      pctAPROBADO: total ? (g.APROBADO / total) * 100 : 0,
      pctALERTA: total ? (g.ALERTA / total) * 100 : 0,
      pctCRÍTICO: total ? (g.CRÍTICO / total) * 100 : 0,
    };
  });
}

/* ------------------------------------------------------------------ */
/* API pública (mock con delay)                                        */
/* ------------------------------------------------------------------ */

export const api = {
  async getKpisResumen() {
    await delay(150);
    return { ...KPIS_RESUMEN_SEED };
  },

  async getAlertasActivas() {
    await delay(120);
    return ALERTAS_ACTIVAS_SEED.map((a) => ({ ...a, riesgo: a.riesgo || 0 }));
  },

  async getAlertasEvolucion() {
    await delay(120);
    return ALERTAS_EVOLUCION_14D;
  },

  async getNormativaDistribucion() {
    await delay(120);
    return NORMATIVA_DISTRIBUCION;
  },

  async getEventosCriticos() {
    await delay(150);
    return buildEventosCriticos();
  },

  async getTransporte() {
    await delay(150);
    const dataset = await getDataset();
    return dataset.transportes;
  },

  async getDosificacion() {
    await delay(150);
    const dataset = await getDataset();
    return dataset.dosificaciones;
  },

  async getTurnos() {
    await delay(140);
    return turnosDataset(await getDataset());
  },

  async getValidacionNormativa() {
    await delay(140);
    return validacionPorNormativa(await getDataset());
  },

  async getOperariosRanking() {
    await delay(120);
    return OPERARIOS_RANKING_SEED;
  },

async getDesviacionLab() {
    await delay(140);
    const dataset = await getDataset();
    return dataset.dosificaciones.map((d) => ({
      x: d.concentracion_ppm,
      y: d.resultado_lab_verificacion_ppm,
      lote_id: d.lote_id,
      desviacion: d.desviacion_lab_pct,
      operario: d.operario_nombre,
      normativa: d.normativa_destino,
    }));
  },

  async getLotes() {
    await delay(100);
    const dataset = await getDataset();
    const set = new Set(dataset.transportes.map((t) => t.lote_id));
    dataset.dosificaciones.forEach((d) => set.add(d.lote_id));
    set.add(LOTE_REFERENCIA);
    return Array.from(set);
  },

  async getRiesgoFinancieroMensual() {
    await delay(120);
    return RIESGO_FINANCIERO_MENSUAL;
  },

  async getTiemposTraslado() {
    await delay(120);
    return TIEMPOS_TRASLADO_MES;
  },

  async getKpisTransporte() {
    await delay(120);
    return KPIS_TRANSPORTE_SEED;
  },

  async getClima(lat, lon) {
    const datos = await fetchClimaReal(lat, lon);
    return {
      ...datos,
      lat,
      lon,
    };
  },

  async getCadena(loteId) {
    await delay(220);
    return chainCompleta(loteId);
  },

  async validateChain(loteId) {
    await delay(260);
    const bloques = await chainCompleta(loteId);
    const resultados = await Promise.all(
      bloques.map(async (b) => {
        const recomputed = await sha256Hex(
          buildChainPayload({
            index: b.index,
            timestamp: b.timestamp,
            tipoEvento: b.tipoEvento,
            data: b.data,
            hash_previo: b.hash_previo,
          }),
        );
        return { ...b, valid: recomputed === b.hash_integridad };
      }),
    );
    const alteraciones = resultados.filter((r) => !r.valid);
    return {
      lote_id: loteId,
      valido: alteraciones.length === 0,
      total_bloques: resultados.length,
      bloques_validos: resultados.length - alteraciones.length,
      alteraciones: alteraciones.length,
      bloque_alterado: alteraciones[0]?.index ?? null,
      bloques: resultados,
    };
  },

  async validateChainProgresivo(loteId, { onProgreso, onLine } = {}) {
    const bloques = await chainCompleta(loteId);
    const resultados = [];
    let validos = 0;

    for (let i = 0; i < bloques.length; i++) {
      const b = bloques[i];
      const recomputed = await sha256Hex(
        buildChainPayload({
          index: b.index,
          timestamp: b.timestamp,
          tipoEvento: b.tipoEvento,
          data: b.data,
          hash_previo: b.hash_previo,
        }),
      );
      const valid = recomputed === b.hash_integridad;
      resultados.push({ ...b, valid });
      if (valid) validos += 1;
      if (onProgreso) onProgreso({ actual: i + 1, total: bloques.length });
      if (onLine) onLine({ index: b.index, valid, hash: b.hash_integridad, tipoEvento: b.tipoEvento });
      await new Promise((resolve) => setTimeout(resolve, 18));
    }

    const alteraciones = resultados.filter((r) => !r.valid);
    return {
      lote_id: loteId,
      valido: alteraciones.length === 0,
      total_bloques: resultados.length,
      bloques_validos: validos,
      alteraciones: alteraciones.length,
      bloque_alterado: alteraciones[0]?.index ?? null,
      bloques: resultados,
    };
  },

  async crearDosificacion(payload) {
    await delay(500);
    const record = await buildDosificacionRecord({
      dosificacion_id: `dos-${Date.now().toString().slice(-6)}`,
      ...payload,
    });
    const dataset = await getDataset();
    dataset.dosificaciones.unshift(record);
    cache = dataset;
    emitChange();
    return record;
  },

  async crearTransporte(payload) {
    await delay(500);
    const record = await buildTransporteRecord(payload);
    const dataset = await getDataset();
    dataset.transportes.unshift(record);
    cache = dataset;
    emitChange();
    return record;
  },

  async generarDatosDemo() {
    await delay(700);
    const dataset = await getDataset();
    const nuevosLotes = [];
    for (let i = 0; i < 10; i++) {
      const ruta = RUTAS[i % RUTAS.length];
      const tipo = i % 3 === 0 ? 'Congelado' : 'Fresco';
      const hora = 11 + (i % 8);
      const inicio = new Date(Date.UTC(2026, 7, 8, hora, (i * 13) % 60)).toISOString();
      const gps = GPS_INICIO_RUTA[ruta];
      nuevosLotes.push(
        await buildTransporteRecord({
          evento_transporte_id: `evt-demo-${String(i + 1).padStart(2, '0')}`,
          lote_id: `ECU-DEMO-${100 + i}-2026-08-08`,
          tipo_producto: tipo,
          peso_kg: 400 + i * 75,
          temperatura_inicial_c: tipo === 'Fresco' ? 1 + i * 0.1 : -19 - i * 0.1,
          gps: gps,
          timestamp_lectura: inicio,
          duracion_horas: 2 + (i % 4) * 0.5,
          n: 12,
          ruta,
          decision_inspector: i === 2 ? 'Rechazado' : 'Aprobado',
          perfil: { base: tipo === 'Fresco' ? 2.6 : -19.5, amp: 0.4, spikeIndex: i === 2 ? 5 : undefined, spikeDelta: 3, ruta },
        }),
      );
    }
    const nuevasDos = [];
    for (let i = 0; i < 5; i++) {
      const op = NOMBRES_OPERARIOS[i % NOMBRES_OPERARIOS.length];
      nuevasDos.push(
        await buildDosificacionRecord({
          dosificacion_id: `dos-demo-${100 + i}`,
          lote_id: `ECU-DEMO-${100 + (i * 2)}-2026-08-08`,
          concentracion_ppm: 90 + i * 12,
          volumen_ml: 900,
          peso_lote_kg: 500 + i * 80,
          operario_id: op.id,
          operario_nombre: op.nombre,
          turno: ['Mañana', 'Tarde', 'Noche'][i % 3],
          normativa_destino: i % 2 ? 'UE' : 'China/GACC',
          timestamp_registro: `2026-08-08T${String(9 + (i % 8))}:30:00Z`,
          resultado_lab_verificacion_ppm: 88 + i * 13,
        }),
      );
    }
    dataset.transportes.push(...nuevosLotes);
    dataset.dosificaciones.push(...nuevasDos);
    cache = dataset;
    emitChange();
    return { lotes: nuevosLotes.length, dosificaciones: nuevasDos.length };
  },
};

