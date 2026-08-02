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
      description: 'Prueba de Concepto (PoC) para validar la integridad de datos logísticos',
    },
    servers: [{ url: 'http://localhost:3001' }],
  },
  apis: ['./src/server.js'], // Ruta donde Swagger buscará los comentarios
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /api/evento:
 *   post:
 *     summary: Registra un evento logístico y lo encadena en la Blockchain
 *     description: Genera un hash SHA-256 integrando los datos actuales y el hash del bloque anterior.
 */
app.post('/api/evento', async (req, res) => {
  const { loteId, temperatura, ubicacion } = req.body;
  const timestamp = new Date().toISOString();

  try {
   
    await pool.query(
      'INSERT INTO lotes_camaron (id, codigo_lote, origen, destino) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
      [loteId, `LOTE-AUTO-${loteId}`, 'Punto de Origen', 'Destino Final']
    );


    const ultimoEvento = await pool.query(
      'SELECT hash_integridad FROM eventos_logisticos WHERE lote_id = $1 ORDER BY id DESC LIMIT 1',
      [loteId]
    );
    
    // Si no hay bloque anterior, se usa el "Genesis Hash" (puros ceros)
    const hashPrevio = ultimoEvento.rows.length > 0 
      ? ultimoEvento.rows[0].hash_integridad 
      : '0000000000000000000000000000000000000000000000000000000000000000';

   
    const dataString = JSON.stringify({ loteId, temperatura, ubicacion, timestamp, hashPrevio });
    const hashIntegridad = crypto.createHash('sha256').update(dataString).digest('hex');

    
    const query = `
      INSERT INTO eventos_logisticos (lote_id, temperatura, ubicacion, hash_integridad, timestamp, hash_previo) 
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
    `;
    const values = [loteId, temperatura, ubicacion, hashIntegridad, timestamp, hashPrevio];
    
    const result = await pool.query(query, values);

    res.status(201).json({
      mensaje: 'Registro logístico encadenado con éxito',
      hashGenerado: hashIntegridad,
      datosGuardados: result.rows[0]
    });
  } catch (error) {
    console.error('Error en la base de datos:', error);
    res.status(500).json({ error: 'Error al guardar el evento en la BD' });
  }
});

/**
 * @swagger
 * /api/eventos:
 *   get:
 *     summary: Obtiene TODOS los eventos logísticos (Para Reportes BI)
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
 *     summary: Obtiene el historial de eventos logísticos de un lote específico
 */
app.get('/api/eventos/:loteId', async (req, res) => {
  const { loteId } = req.params;
  try {
    const query = `
      SELECT id, temperatura, ubicacion, timestamp, hash_integridad, hash_previo 
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
 *     summary: Verifica la integridad de la cadena de bloques para un lote específico
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
 *     summary: Obtiene la configuración global del sistema
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
 *     summary: Actualiza la configuración global del sistema
 */
app.put('/api/configuracion', async (req, res) => {
  const { umbralTemperatura, frecuenciaScraping } = req.body;
  try {
    await pool.query(
      'UPDATE configuracion SET umbral_temperatura = $1, frecuencia_scraping = $2 WHERE id = 1',
      [umbralTemperatura, frecuenciaScraping]
    );
    res.json({ mensaje: 'Configuración actualizada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
});

// --- Caché simple en memoria para la API de FRED ---
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 horas (Se podría vincular a la BD en un refactor futuro)
let precioCache = { precio: null, fuente: null, timestamp: 0 };
const PRECIO_RESPALDO = { precio: '5.45', moneda: 'USD/kg', fuente: 'Valor de respaldo (offline)' };

async function obtenerPrecioDesdeFred() {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    throw new Error('Falta la variable de entorno FRED_API_KEY');
  }

  const url = 'https://api.stlouisfed.org/fred/series/observations';
  const { data } = await axios.get(url, {
    timeout: 8000,
    params: {
      series_id: 'PSHRIUSDM',
      api_key: apiKey,
      file_type: 'json',
      sort_order: 'desc',
      limit: 1
    }
  });

  const ultimaObservacion = data.observations && data.observations[0];
  if (!ultimaObservacion || ultimaObservacion.value === '.') return null;

  return {
    precio: parseFloat(ultimaObservacion.value).toFixed(2),
    periodo: ultimaObservacion.date,
    fuente: 'FRED / FMI - Global price of Shrimp'
  };
}

/**
 * @swagger
 * /api/mercado/precio-camaron:
 *   get:
 *     summary: Obtiene el precio internacional del camarón (API de FRED)
 */
app.get('/api/mercado/precio-camaron', async (req, res) => {
  const ahora = Date.now();

  if (precioCache.precio && (ahora - precioCache.timestamp) < CACHE_TTL_MS) {
    return res.json({
      precio: precioCache.precio,
      moneda: 'USD/kg',
      periodo: precioCache.periodo,
      fuente: precioCache.fuente,
      cacheado: true
    });
  }

  try {
    const resultado = await obtenerPrecioDesdeFred();

    if (resultado) {
      precioCache = { precio: resultado.precio, periodo: resultado.periodo, fuente: resultado.fuente, timestamp: ahora };
      return res.json({
        precio: resultado.precio,
        moneda: 'USD/kg',
        periodo: resultado.periodo,
        fuente: resultado.fuente,
        cacheado: false
      });
    }

    console.warn('FRED respondió pero sin un valor disponible para el periodo más reciente.');
    return res.json(PRECIO_RESPALDO);

  } catch (error) {
    console.error('Error al consultar la API de FRED:', error.message);
    return res.json(PRECIO_RESPALDO);
  }
});


const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor de trazabilidad corriendo en el puerto ${PORT}`);
  console.log(`Documentación Swagger disponible en: http://localhost:${PORT}/api-docs`);
});