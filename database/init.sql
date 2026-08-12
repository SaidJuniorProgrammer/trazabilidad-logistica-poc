-- PostgreSQL 15 - Esquema alineado al backend (server.js)
-- Este esquema reproduce EXACTAMENTE las tablas y columnas que usa la API en backend/src/server.js
-- OLTP (3FN) + Data Warehouse (Esquema Estrella) + Vistas Agregadas + Configuración

-- ==========================================
-- 0. Configuración global de umbrales
-- ==========================================
CREATE TABLE IF NOT EXISTS configuracion (
    id SERIAL PRIMARY KEY,
    umbral_temperatura_fresco_min NUMERIC(4,2) NOT NULL DEFAULT 0,
    umbral_temperatura_fresco_max NUMERIC(4,2) NOT NULL DEFAULT 4,
    umbral_temperatura_congelado_max NUMERIC(4,2) NOT NULL DEFAULT -18,
    frecuencia_scraping INT NOT NULL DEFAULT 30
);

INSERT INTO configuracion (id, umbral_temperatura_fresco_min, umbral_temperatura_fresco_max, umbral_temperatura_congelado_max, frecuencia_scraping)
VALUES (1, 0, 4, -18, 30)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 1. OLTP: Tablas Transaccionales Críticas
-- ==========================================
CREATE TABLE IF NOT EXISTS lotes_camaron (
    id SERIAL PRIMARY KEY,
    codigo_lote VARCHAR(50) NOT NULL,
    tipo_producto VARCHAR(20) NOT NULL DEFAULT 'Congelado',
    peso_lote_kg NUMERIC(10,2),
    origen VARCHAR(100),
    destino VARCHAR(100),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS eventos_logisticos (
    id SERIAL PRIMARY KEY,
    lote_id INT REFERENCES lotes_camaron(id) ON DELETE CASCADE,
    temperatura_camara_c NUMERIC(4,2),
    gps_lat NUMERIC(10,8),
    gps_lon NUMERIC(11,8),
    ubicacion VARCHAR(200),
    alerta_termica BOOLEAN DEFAULT FALSE,
    hash_integridad VARCHAR(64),
    hash_previo VARCHAR(64),
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_evento_lote_hash UNIQUE (lote_id, timestamp, hash_integridad)
);

CREATE TABLE IF NOT EXISTS eventos_dosificacion (
    id SERIAL PRIMARY KEY,
    lote_id INT REFERENCES lotes_camaron(id) ON DELETE CASCADE,
    concentracion_ppm NUMERIC(8,2) NOT NULL,
    volumen_ml NUMERIC(8,2),
    operario VARCHAR(30),
    normativa_destino VARCHAR(50),
    estado_validacion VARCHAR(20),
    riesgo_financiero_usd NUMERIC(12,2) DEFAULT 0,
    hash_integridad VARCHAR(64),
    hash_previo VARCHAR(64),
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. Data Warehouse (DW): Dimensiones
-- ==========================================
CREATE TABLE IF NOT EXISTS dim_tiempo (
    sk_tiempo SERIAL PRIMARY KEY,
    fecha DATE UNIQUE NOT NULL,
    ano INT,
    trimestre INT,
    mes INT,
    semana INT,
    dia INT
);

CREATE TABLE IF NOT EXISTS dim_lote (
    sk_lote SERIAL PRIMARY KEY,
    lote_id INT UNIQUE NOT NULL,
    codigo_lote VARCHAR(50),
    tipo_producto VARCHAR(20),
    origen VARCHAR(100),
    destino VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS dim_operario (
    sk_operario SERIAL PRIMARY KEY,
    nombre VARCHAR(30) UNIQUE NOT NULL,
    turno_asignado VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS dim_normativa (
    sk_normativa SERIAL PRIMARY KEY,
    mercado VARCHAR(50) UNIQUE NOT NULL,
    limite_ppm NUMERIC(6,2)
);

CREATE TABLE IF NOT EXISTS dim_ruta (
    sk_ruta SERIAL PRIMARY KEY,
    provincia_origen VARCHAR(50),
    provincia_destino VARCHAR(50),
    distancia_km_estandar NUMERIC(6,2)
);

CREATE TABLE IF NOT EXISTS dim_vehiculo (
    sk_vehiculo SERIAL PRIMARY KEY,
    placa VARCHAR(20) UNIQUE,
    modelo_refrigeracion VARCHAR(50),
    capacidad_kg NUMERIC(10,2)
);

-- ==========================================
-- 3. Data Warehouse (DW): Hechos
-- ==========================================
CREATE TABLE IF NOT EXISTS hecho_transporte (
    sk_transporte BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    fk_tiempo INT REFERENCES dim_tiempo(sk_tiempo),
    fk_lote INT REFERENCES dim_lote(sk_lote),
    fk_vehiculo INT REFERENCES dim_vehiculo(sk_vehiculo),
    fk_ruta INT REFERENCES dim_ruta(sk_ruta),
    temperatura_c NUMERIC(4,2),
    gps_lat NUMERIC(10,8),
    gps_lon NUMERIC(11,8),
    alerta_termica BOOLEAN,
    bloque_hash VARCHAR(64)
);

CREATE TABLE IF NOT EXISTS hecho_dosificacion (
    sk_dosificacion BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    fk_tiempo INT REFERENCES dim_tiempo(sk_tiempo),
    fk_lote INT REFERENCES dim_lote(sk_lote),
    fk_operario INT REFERENCES dim_operario(sk_operario),
    fk_normativa INT REFERENCES dim_normativa(sk_normativa),
    concentracion_ppm NUMERIC(8,2),
    estado_validacion VARCHAR(20),
    riesgo_financiero_usd NUMERIC(12,2),
    bloque_hash VARCHAR(64)
);

-- ==========================================
-- 4. Vistas Agregadas para BI y Auditoría
-- ==========================================
CREATE OR REPLACE VIEW vista_kpi_transporte AS 
SELECT 
    dl.lote_id,
    dl.codigo_lote, 
    dl.tipo_producto, 
    dt.fecha, 
    COUNT(*) AS total_lecturas_iot, 
    ROUND(AVG(ht.temperatura_c), 2) AS temp_promedio_viaje, 
    ROUND(MAX(ht.temperatura_c), 2) AS temp_maxima_viaje, 
    ROUND(MIN(ht.temperatura_c), 2) AS temp_minima_viaje, 
    SUM(CASE WHEN ht.alerta_termica THEN 1 ELSE 0 END) AS count_alertas_termicas, 
    MAX(ht.bloque_hash) AS ultimo_bloque_hash
FROM hecho_transporte ht 
JOIN dim_tiempo dt ON ht.fk_tiempo = dt.sk_tiempo 
JOIN dim_lote dl ON ht.fk_lote = dl.sk_lote 
GROUP BY dl.lote_id, dl.codigo_lote, dl.tipo_producto, dt.fecha;

CREATE OR REPLACE VIEW vista_kpi_dosificacion AS 
SELECT 
    dl.lote_id,
    dl.codigo_lote,
    dn.mercado, 
    dop.nombre AS operario_nombre,
    dt.fecha, 
    hd.concentracion_ppm, 
    hd.concentracion_ppm * 0.67 AS so2_residual_ppm,
    hd.estado_validacion, 
    hd.riesgo_financiero_usd, 
    hd.bloque_hash,
    dn.limite_ppm,
    ROUND(((hd.concentracion_ppm / NULLIF(dn.limite_ppm, 0)) - 1) * 100, 2) AS exceso_pct
FROM hecho_dosificacion hd 
JOIN dim_tiempo dt ON hd.fk_tiempo = dt.sk_tiempo 
JOIN dim_lote dl ON hd.fk_lote = dl.sk_lote 
JOIN dim_normativa dn ON hd.fk_normativa = dn.sk_normativa 
LEFT JOIN dim_operario dop ON hd.fk_operario = dop.sk_operario;

CREATE OR REPLACE VIEW vista_auditoria_integridad AS 
SELECT 
    id AS bloque_id,
    lote_id,
    'transporte' AS tipo_evento,
    hash_integridad,
    hash_previo,
    timestamp AS timestamp_inmutabilizacion,
    temperatura_camara_c::TEXT AS dato_critico
FROM eventos_logisticos
UNION ALL
SELECT 
    id,
    lote_id,
    'dosificacion' AS tipo_evento,
    hash_integridad,
    hash_previo,
    timestamp AS timestamp_inmutabilizacion,
    concentracion_ppm::TEXT AS dato_critico
FROM eventos_dosificacion
ORDER BY timestamp_inmutabilizacion;