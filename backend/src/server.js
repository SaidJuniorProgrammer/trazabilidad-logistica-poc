require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const { Pool } = require('pg');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
  user: 'admin',
  host: 'db',
  database: 'camaron_db',
  password: 'admin123',
  port: 5432,
});

pool.on('error', (err, client) => {
  console.error('Error inesperado en la base de datos (Protección activa):', err.message);
});

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Trazabilidad Camarón',
      version: '1.0.0',
      description: 'Prueba de Concepto (PoC) avanzada para trazabilidad y calidad',
    },
    servers: [{ url: 'http://localhost:3001' }],
  },
  apis: ['./src/server.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// --- Lógica de FRED para precios (Cacheada) ---
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
let precioCache = { precio: null, fuente: null, timestamp: 0, periodo: null };
const PRECIO_RESPALDO = { precio: '5.45', moneda: 'USD/kg', fuente: 'Valor de respaldo (offline)' };

async function obtenerPrecioCacheadoOConsultar() {
  const ahora = Date.now();
  if (precioCache.precio && (ahora - precioCache.timestamp) < CACHE_TTL_MS) {
    return { ...precioCache, cacheado: true };
  }
  
  try {
    const apiKey = process.env.FRED_API_KEY;
    if (!apiKey) return PRECIO_RESPALDO;
    
    const url = 'https://api.stlouisfed.org/fred/series/observations';
    const { data } = await axios.get(url, {
      timeout: 8000,
      params: { series_id: 'PSHRIUSDM', api_key: apiKey, file_type: 'json', sort_order: 'desc', limit: 1 }
    });
    
    const obs = data.observations && data.observations[0];
    if (obs && obs.value !== '.') {
      precioCache = {
        precio: parseFloat(obs.value).toFixed(2),
        periodo: obs.date,
        fuente: 'FRED / FMI - Global price of Shrimp',
        timestamp: ahora
      };
      return { ...precioCache, cacheado: false };
    }
  } catch (err) {
    console.error('Error al consultar FRED:', err.message);
  }
  return PRECIO_RESPALDO;
}

/**
 * @swagger
 * /api/evento:
 *   post:
 *     summary: Registra un evento logístico (Transporte) con enriquecimiento de datos y encadenado
 */
app.post('/api/evento', async (req, res) => {
  const { loteId, temperatura, gps_lat, gps_lon, ubicacion } = req.body;
  const timestamp = new Date().toISOString();

  try {
    // 1. Asegurar Lote
    const loteRes = await pool.query(
      'INSERT INTO lotes_camaron (id, codigo_lote, origen, destino, tipo_producto) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO UPDATE SET id=EXCLUDED.id RETURNING *',
      [loteId, `LOTE-AUTO-${loteId}`, 'Punto de Origen', 'Destino Final', 'Congelado']
    );
    const loteData = loteRes.rows[0];

    // 2. Enriquecimiento con Open-Meteo
    let climaExterno = null;
    if (gps_lat && gps_lon) {
      try {
        const wRes = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${gps_lat}&longitude=${gps_lon}&current_weather=true`, { timeout: 4000 });
        climaExterno = wRes.data?.current_weather?.temperature;
      } catch (e) {
        console.warn('No se pudo obtener clima de Open-Meteo');
      }
    }
    const ubicacionFinal = climaExterno !== null ? `${ubicacion || 'Ruta'} (Temp Ext: ${climaExterno}°C)` : (ubicacion || 'Ruta');

    // 3. Validación Térmica
    const confRes = await pool.query('SELECT * FROM configuracion WHERE id = 1');
    const conf = confRes.rows[0];
    let alerta_termica = false;
    const tempNum = parseFloat(temperatura);

    if (loteData.tipo_producto === 'Fresco') {
      if (tempNum < parseFloat(conf.umbral_temperatura_fresco_min) || tempNum > parseFloat(conf.umbral_temperatura_fresco_max)) {
        alerta_termica = true;
      }
    } else { // Congelado
      if (tempNum > parseFloat(conf.umbral_temperatura_congelado_max)) {
        alerta_termica = true;
      }
    }

    // 4. Hash anterior
    const ultimoEvento = await pool.query('SELECT hash_integridad FROM eventos_logisticos WHERE lote_id = $1 ORDER BY id DESC LIMIT 1', [loteId]);
    const hashPrevio = ultimoEvento.rows.length > 0 ? ultimoEvento.rows[0].hash_integridad : '0000000000000000000000000000000000000000000000000000000000000000';

    // 5. Hash Actual
    const dataString = JSON.stringify({ loteId, temperatura: tempNum, gps_lat, gps_lon, ubicacion: ubicacionFinal, alerta_termica, timestamp, hashPrevio });
    const hashIntegridad = crypto.createHash('sha256').update(dataString).digest('hex');

    // 6. OLTP (eventos_logisticos)
    const qOltp = `
      INSERT INTO eventos_logisticos (lote_id, temperatura_camara_c, gps_lat, gps_lon, ubicacion, alerta_termica, hash_integridad, timestamp, hash_previo) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;
    `;
    const vOltp = [loteId, tempNum, gps_lat, gps_lon, ubicacionFinal, alerta_termica, hashIntegridad, timestamp, hashPrevio];
    const resOltp = await pool.query(qOltp, vOltp);

    // 7. DW - Insertando en modelo Estrella
    const dateObj = new Date(timestamp);
    const qDimTiempo = `
      INSERT INTO dim_tiempo (fecha, ano, trimestre, mes, semana, dia)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (fecha) DO UPDATE SET fecha=EXCLUDED.fecha RETURNING sk_tiempo;
    `;
    const rDimTiempo = await pool.query(qDimTiempo, [
      dateObj.toISOString().split('T')[0],
      dateObj.getFullYear(),
      Math.floor(dateObj.getMonth() / 3) + 1,
      dateObj.getMonth() + 1,
      Math.ceil(dateObj.getDate() / 7),
      dateObj.getDate()
    ]);
    const skTiempo = rDimTiempo.rows[0].sk_tiempo;

    const qDimLote = `
      INSERT INTO dim_lote (lote_id, codigo_lote, tipo_producto, origen, destino)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (lote_id) DO UPDATE SET lote_id=EXCLUDED.lote_id RETURNING sk_lote;
    `;
    const rDimLote = await pool.query(qDimLote, [loteData.id, loteData.codigo_lote, loteData.tipo_producto, loteData.origen, loteData.destino]);
    const skLote = rDimLote.rows[0].sk_lote;

    await pool.query(
      `INSERT INTO hecho_transporte (fk_tiempo, fk_lote, temperatura_c, alerta_termica, gps_lat, gps_lon, bloque_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [skTiempo, skLote, tempNum, alerta_termica, gps_lat, gps_lon, hashIntegridad]
    );

    res.status(201).json({
      mensaje: 'Registro logístico enriquecido y encadenado con éxito',
      hashGenerado: hashIntegridad,
      alerta_termica,
      datosGuardados: resOltp.rows[0]
    });
  } catch (error) {
    console.error('Error en evento logístico:', error);
    res.status(500).json({ error: 'Error al procesar el evento logístico' });
  }
});

/**
 * @swagger
 * /api/eventos:
 *   get:
 *     summary: Obtiene TODOS los eventos logísticos
 */
app.get('/api/eventos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM eventos_logisticos ORDER BY timestamp ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener todos los eventos' });
  }
});

/**
 * @swagger
 * /api/eventos/{loteId}:
 *   get:
 *     summary: Obtiene el historial logístico de un lote
 */
app.get('/api/eventos/:loteId', async (req, res) => {
  const { loteId } = req.params;
  try {
    const query = `
      SELECT id, temperatura_camara_c as temperatura, gps_lat, gps_lon, alerta_termica, ubicacion, timestamp, hash_integridad, hash_previo 
      FROM eventos_logisticos 
      WHERE lote_id = $1 
      ORDER BY id ASC;
    `;
    const result = await pool.query(query, [loteId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el historial' });
  }
});

/**
 * @swagger
 * /api/blockchain/verificar/{loteId}:
 *   get:
 *     summary: Verifica la integridad de la cadena de transporte
 */
app.get('/api/blockchain/verificar/:loteId', async (req, res) => {
  const { loteId } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT id, hash_integridad, hash_previo FROM eventos_logisticos WHERE lote_id = $1 ORDER BY id ASC',
      [loteId]
    );

    let cadenaValida = true;
    let bloqueAlterado = null;

    for (let i = 1; i < rows.length; i++) {
      if (rows[i].hash_previo !== rows[i - 1].hash_integridad) {
        cadenaValida = false;
        bloqueAlterado = rows[i].id;
        break;
      }
    }

    res.json({ integra: cadenaValida, bloqueAlterado, totalBloques: rows.length });
  } catch (error) {
    console.error('Error al verificar:', error);
    res.status(500).json({ error: 'Error al verificar la cadena' });
  }
});

/**
 * @swagger
 * /api/configuracion:
 *   get:
 *     summary: Obtiene la configuración global
 */
app.get('/api/configuracion', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM configuracion WHERE id = 1');
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
});

/**
 * @swagger
 * /api/configuracion:
 *   put:
 *     summary: Actualiza la configuración global
 */
app.put('/api/configuracion', async (req, res) => {
  const { umbral_temperatura_fresco_min, umbral_temperatura_fresco_max, umbral_temperatura_congelado_max, frecuencia_scraping } = req.body;
  try {
    await pool.query(
      'UPDATE configuracion SET umbral_temperatura_fresco_min = $1, umbral_temperatura_fresco_max = $2, umbral_temperatura_congelado_max = $3, frecuencia_scraping = $4 WHERE id = 1',
      [umbral_temperatura_fresco_min, umbral_temperatura_fresco_max, umbral_temperatura_congelado_max, frecuencia_scraping]
    );
    res.json({ mensaje: 'Configuración actualizada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
});

/**
 * @swagger
 * /api/dosificacion:
 *   post:
 *     summary: Registra un evento de dosificación de metabisulfito, validando normativa y encadenado
 */
app.post('/api/dosificacion', async (req, res) => {
  const { loteId, concentracion_ppm, volumen_ml, operario, mercado_destino } = req.body;
  const timestamp = new Date().toISOString();

  try {
    // 1. Asegurar Lote
    const loteRes = await pool.query(
      'INSERT INTO lotes_camaron (id, codigo_lote, origen, destino, tipo_producto) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO UPDATE SET id=EXCLUDED.id RETURNING *',
      [loteId, `LOTE-AUTO-${loteId}`, 'Planta Empacadora', mercado_destino || 'Exportación', 'Congelado']
    );
    const loteData = loteRes.rows[0];

    // 2. Validación de Límites (China:100, UE:150, FDA:100)
    let limite = 100; 
    if (mercado_destino === 'UE') limite = 150;
    
    let estado_validacion = 'APROBADO';
    if (concentracion_ppm > limite) {
      if (concentracion_ppm > limite * 1.1) {
        estado_validacion = 'CRITICO';
      } else {
        estado_validacion = 'ALERTA';
      }
    }

    // 3. Riesgo Financiero
    let riesgo_financiero_usd = 0;
    if (estado_validacion !== 'APROBADO') {
      const precioData = await obtenerPrecioCacheadoOConsultar();
      const precioNum = parseFloat(precioData.precio || 5.45);
      const pesoKg = parseFloat(loteData.peso_lote_kg || 1000);
      riesgo_financiero_usd = precioNum * pesoKg;
    }

    // 4. Hash anterior
    const ultimoEvento = await pool.query('SELECT hash_integridad FROM eventos_dosificacion WHERE lote_id = $1 ORDER BY id DESC LIMIT 1', [loteId]);
    const hashPrevio = ultimoEvento.rows.length > 0 ? ultimoEvento.rows[0].hash_integridad : '0000000000000000000000000000000000000000000000000000000000000000';

    // 5. Hash Actual
    const dataString = JSON.stringify({ loteId, concentracion_ppm, volumen_ml, operario, mercado_destino, estado_validacion, riesgo_financiero_usd, timestamp, hashPrevio });
    const hashIntegridad = crypto.createHash('sha256').update(dataString).digest('hex');

    // 6. OLTP (eventos_dosificacion)
    const qOltp = `
      INSERT INTO eventos_dosificacion (lote_id, concentracion_ppm, volumen_ml, operario, normativa_destino, estado_validacion, riesgo_financiero_usd, hash_integridad, timestamp, hash_previo) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *;
    `;
    const vOltp = [loteId, concentracion_ppm, volumen_ml, operario, mercado_destino, estado_validacion, riesgo_financiero_usd, hashIntegridad, timestamp, hashPrevio];
    const resOltp = await pool.query(qOltp, vOltp);

    // 7. DW - Dimensiones y Hechos
    const dateObj = new Date(timestamp);
    const qDimTiempo = `
      INSERT INTO dim_tiempo (fecha, ano, trimestre, mes, semana, dia)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (fecha) DO UPDATE SET fecha=EXCLUDED.fecha RETURNING sk_tiempo;
    `;
    const rDimTiempo = await pool.query(qDimTiempo, [
      dateObj.toISOString().split('T')[0],
      dateObj.getFullYear(),
      Math.floor(dateObj.getMonth() / 3) + 1,
      dateObj.getMonth() + 1,
      Math.ceil(dateObj.getDate() / 7),
      dateObj.getDate()
    ]);
    const skTiempo = rDimTiempo.rows[0].sk_tiempo;

    const qDimLote = `
      INSERT INTO dim_lote (lote_id, codigo_lote, tipo_producto, origen, destino)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (lote_id) DO UPDATE SET lote_id=EXCLUDED.lote_id RETURNING sk_lote;
    `;
    const rDimLote = await pool.query(qDimLote, [loteData.id, loteData.codigo_lote, loteData.tipo_producto, loteData.origen, loteData.destino]);
    const skLote = rDimLote.rows[0].sk_lote;

    const qDimOperario = `
      INSERT INTO dim_operario (nombre) VALUES ($1) ON CONFLICT (nombre) DO UPDATE SET nombre=EXCLUDED.nombre RETURNING sk_operario;
    `;
    const rDimOp = await pool.query(qDimOperario, [operario]);
    const skOperario = rDimOp.rows[0].sk_operario;

    const qDimNormativa = `
      INSERT INTO dim_normativa (mercado, limite_ppm) VALUES ($1, $2) ON CONFLICT (mercado) DO UPDATE SET mercado=EXCLUDED.mercado RETURNING sk_normativa;
    `;
    const rDimNorm = await pool.query(qDimNormativa, [mercado_destino, limite]);
    const skNormativa = rDimNorm.rows[0].sk_normativa;

    await pool.query(
      `INSERT INTO hecho_dosificacion (fk_tiempo, fk_lote, fk_operario, fk_normativa, concentracion_ppm, estado_validacion, riesgo_financiero_usd, bloque_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [skTiempo, skLote, skOperario, skNormativa, concentracion_ppm, estado_validacion, riesgo_financiero_usd, hashIntegridad]
    );

    res.status(201).json({
      mensaje: 'Registro de dosificación procesado y encadenado',
      estado_validacion,
      riesgo_financiero_usd,
      hashGenerado: hashIntegridad,
      datosGuardados: resOltp.rows[0]
    });
  } catch (error) {
    console.error('Error en evento de dosificación:', error);
    res.status(500).json({ error: 'Error al procesar el evento de dosificación' });
  }
});

/**
 * @swagger
 * /api/dosificacion/{loteId}:
 *   get:
 *     summary: Obtiene el historial de dosificación de un lote
 */
app.get('/api/dosificacion/:loteId', async (req, res) => {
  const { loteId } = req.params;
  try {
    const query = `
      SELECT id, concentracion_ppm, volumen_ml, operario, normativa_destino as mercado_destino, estado_validacion, riesgo_financiero_usd, timestamp, hash_integridad, hash_previo 
      FROM eventos_dosificacion 
      WHERE lote_id = $1 
      ORDER BY id ASC;
    `;
    const result = await pool.query(query, [loteId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

/**
 * @swagger
 * /api/blockchain/verificar-dosificacion/{loteId}:
 *   get:
 *     summary: Verifica la integridad de la cadena de dosificación
 */
app.get('/api/blockchain/verificar-dosificacion/:loteId', async (req, res) => {
  const { loteId } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT id, hash_integridad, hash_previo FROM eventos_dosificacion WHERE lote_id = $1 ORDER BY id ASC',
      [loteId]
    );

    let cadenaValida = true;
    let bloqueAlterado = null;

    for (let i = 1; i < rows.length; i++) {
      if (rows[i].hash_previo !== rows[i - 1].hash_integridad) {
        cadenaValida = false;
        bloqueAlterado = rows[i].id;
        break;
      }
    }

    res.json({ integra: cadenaValida, bloqueAlterado, totalBloques: rows.length });
  } catch (error) {
    console.error('Error al verificar:', error);
    res.status(500).json({ error: 'Error al verificar la cadena' });
  }
});

/**
 * @swagger
 * /api/mercado/precio-camaron:
 *   get:
 *     summary: Obtiene el precio internacional del camarón
 */
app.get('/api/mercado/precio-camaron', async (req, res) => {
  const precioData = await obtenerPrecioCacheadoOConsultar();
  return res.json({
    precio: precioData.precio,
    moneda: precioData.moneda || 'USD/kg',
    periodo: precioData.periodo,
    fuente: precioData.fuente,
    cacheado: precioData.cacheado
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor de trazabilidad corriendo en el puerto ${PORT}`);
  console.log(`Documentación Swagger disponible en: http://localhost:${PORT}/api-docs`);
});